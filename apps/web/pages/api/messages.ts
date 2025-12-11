import { NextApiRequest, NextApiResponse } from 'next';
import { Server as SocketIOServer } from 'socket.io';
import { dbHelpers } from '../../lib/prisma';
import { MessageEncryption, validateMessageSecurity } from '../../lib/security/index';
import enterpriseSocketServer from '../../lib/socket/enterprise-socket-server';
import { verifyToken } from '../../middleware/auth';
import { NextApiResponseServerIO } from '../../types/next';
import type { ClientToServerEvents, ServerToClientEvents, SocketData } from '../../types/socket';
import { withApiRateLimit } from '../../utils/rateLimiter';

interface MessageRequest {
  senderId: string;
  receiverId?: string;
  conversationId?: string;
  content: string;
  type: 'TEXT' | 'IMAGE' | 'VOICE' | 'FILE' | 'LOCATION' | 'BID' | 'VIDEO';
}

// ملاحظة: تمت إزالة الأنواع غير المستخدمة لتقليل تحذيرات ESLint

async function handler(req: NextApiRequest, res: NextApiResponseServerIO) {
  try {
    // تشخيص: تسجيل معلومات المصادقة
    const authHeader = req.headers.authorization;
    const cookieToken = req.cookies?.token;
    console.log('[API Messages] 🔍 Auth debug:', {
      hasAuthHeader: !!authHeader,
      authHeaderPrefix: authHeader?.substring(0, 30) + '...',
      authHeaderLength: authHeader?.length || 0,
      hasCookieToken: !!cookieToken,
      cookieTokenLength: cookieToken?.length || 0,
      method: req.method,
      url: req.url?.substring(0, 100),
    });

    const authUser = await verifyToken(req);
    console.log('[API Messages] 👤 User result:', {
      authenticated: !!authUser,
      userId: authUser?.id || 'NULL',
      name: authUser?.name || 'NULL',
    });

    switch (req.method) {
      case 'GET':
        return await getMessages(req, res, authUser?.id || null);
      case 'POST':
        if (!authUser?.id) return res.status(401).json({ success: false, error: 'Unauthorized' });
        return await sendMessage(req, res, authUser.id);
      case 'PUT':
        if (!authUser?.id) return res.status(401).json({ success: false, error: 'Unauthorized' });
        return await updateMessage(req, res, authUser.id);
      case 'DELETE':
        if (!authUser?.id) return res.status(401).json({ success: false, error: 'Unauthorized' });
        return await deleteMessage(req, res, authUser.id);
      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        return res.status(405).json({ success: false, error: 'طريقة غير مدعومة' });
    }
  } catch (error) {
    console.error('خطأ في API الرسائل:', error);
    return res.status(500).json({ success: false, error: 'خطأ في الخادم' });
  }
}

async function getMessages(req: NextApiRequest, res: NextApiResponseServerIO, authUserId: string | null) {
  try {
    // فرض المصادقة لجميع عمليات جلب الرسائل
    if (!authUserId) {
      return res.status(401).json({ success: false, error: 'يجب تسجيل الدخول' });
    }

    const { userId, conversationId, otherUserId, limit = '50', search } = req.query;
    const limitNum = parseInt(limit as string);

    console.log('[API Messages GET] 📥 طلب جلب رسائل:', { userId, conversationId, authUserId });

    // التحقق من تطابق المستخدم المصادق مع المستخدم المطلوب
    if (userId && String(authUserId) !== String(userId)) {
      return res.status(403).json({ success: false, error: 'غير مسموح' });
    }

    let messages;
    let conversations;

    if (conversationId) {
      const convIdStr = conversationId as string;

      // 🆕 التعامل مع المحادثات المؤقتة (temp-...)
      // هذه المحادثات تُنشأ في الواجهة فقط ولا توجد في قاعدة البيانات بعد
      if (convIdStr.startsWith('temp-')) {
        console.log('[API Messages GET] 📝 محادثة مؤقتة، إرجاع قائمة فارغة:', convIdStr);
        return res.status(200).json({
          success: true,
          messages: [],
          isTemporary: true,
        });
      }

      // جلب رسائل محادثة محددة - مع التحقق من العضوية
      console.log('[API Messages GET] 🔍 التحقق من عضوية المستخدم:', authUserId, 'في المحادثة:', convIdStr);
      const allowed = await dbHelpers.isUserInConversation(convIdStr, authUserId);
      if (!allowed) {
        console.log('[API Messages GET] ❌ ممنوع: المستخدم ليس عضواً في المحادثة');
        return res.status(403).json({ success: false, error: 'غير مسموح بالوصول لهذه المحادثة' });
      }
      console.log('[API Messages GET] ✅ المستخدم عضو في المحادثة, جلب الرسائل...');
      messages = await dbHelpers.getConversationMessages(convIdStr, limitNum);
    } else if (otherUserId) {
      // جلب رسائل بين المستخدم المصادق ومستخدم آخر
      messages = await dbHelpers.getMessagesBetweenUsers(authUserId, otherUserId as string);
    } else if (search) {
      // البحث في رسائل المستخدم المصادق
      messages = await dbHelpers.searchMessages(authUserId, search as string, limitNum);
    } else {
      // جلب جميع رسائل المستخدم المصادق
      messages = await dbHelpers.getUserMessages(authUserId, limitNum);
      conversations = await dbHelpers.getUserConversations(authUserId);
    }

    // فك تشفير الرسائل وإزالة البيانات الحساسة
    const processedMessages = Array.isArray(messages)
      ? messages.map((m: any) => {
        let content = String(m?.content || '');

        // فك التشفير إذا لزم
        try {
          const meta = m.metadata ? JSON.parse(String(m.metadata)) : null;
          if (meta?.encrypted && meta.iv && meta.tag && content) {
            const decrypted = MessageEncryption.decrypt(content, meta.iv, meta.tag);
            if (decrypted) content = decrypted;
          }
        } catch (_) {
          // استخدام المحتوى الأصلي عند فشل فك التشفير
        }

        // إرجاع البيانات المنقاة للعميل
        return {
          id: String(m.id),
          senderId: String(m.senderId),
          conversationId: String(m.conversationId),
          content,
          type: String(m.type || 'TEXT'),
          status: String(m.status || 'SENT'),
          createdAt: m.createdAt,
        };
      })
      : [];

    console.log('[API Messages GET] ✅ تمت معالجة', processedMessages.length, 'رسالة للإرسال');
    if (processedMessages.length > 0) {
      console.log('[API Messages GET] 📋 عينة من الرسائل:', processedMessages.slice(0, 2).map((m: any) => ({
        id: m.id,
        content: String(m.content).substring(0, 30),
        type: m.type,
      })));
    }

    const response: { success: true; messages: unknown[]; conversations?: unknown[]; } = {
      success: true,
      messages: processedMessages,
    };

    if (conversations) {
      response.conversations = conversations;
    }

    return res.status(200).json(response);
  } catch (error) {
    console.error('خطأ في جلب الرسائل:', error);
    return res.status(500).json({
      success: false,
      error: 'فشل في جلب الرسائل',
    });
  }
}

async function sendMessage(req: NextApiRequest, res: NextApiResponseServerIO, authUserId: string) {
  try {
    const {
      senderId,
      receiverId,
      conversationId,
      content,
      type = 'TEXT',
    }: MessageRequest = req.body;

    // 🔍 تشخيص: طباعة البيانات الواردة
    console.log('[API Messages] 📤 طلب إرسال رسالة:', {
      senderId,
      receiverId,
      conversationId,
      contentLength: content?.length || 0,
      type,
      authUserId,
    });

    // فحص الأمان أولاً
    const securityCheck = validateMessageSecurity(senderId, content);
    if (!securityCheck.valid) {
      console.error('[API Messages] ❌ فشل فحص الأمان:', securityCheck.errors);
      return res.status(400).json({
        success: false,
        error: 'فشل في فحص الأمان',
        details: securityCheck.errors,
        warnings: securityCheck.warnings,
      });
    }

    // التحقق من صحة البيانات
    if (!senderId || !content) {
      console.error('[API Messages] ❌ بيانات ناقصة:', { senderId: !!senderId, content: !!content });
      return res.status(400).json({
        success: false,
        error: 'معرف المرسل والمحتوى مطلوبان',
      });
    }

    // التحقق من تطابق المرسل مع المستخدم المصادق
    if (String(senderId) !== String(authUserId)) {
      console.error('[API Messages] ❌ عدم تطابق المرسل:', { senderId, authUserId });
      return res.status(403).json({ success: false, error: 'غير مسموح: بيانات المرسل غير متطابقة' });
    }

    // التحقق من وجود معرف المحادثة أو معرف المستقبل
    if (!conversationId && !receiverId) {
      console.error('[API Messages] ❌ معرف المحادثة أو المستقبل مفقود');
      return res.status(400).json({
        success: false,
        error: 'معرف المحادثة أو معرف المستقبل مطلوب',
      });
    }

    // التحقق من طول المحتوى للرسائل النصية
    if (type === 'TEXT' && content.length > 2000) {
      return res.status(400).json({
        success: false,
        error: 'محتوى الرسالة طويل جداً (الحد الأقصى 2000 حرف)',
      });
    }

    // التحقق من صحة نوع الرسالة
    const validTypes = ['TEXT', 'IMAGE', 'VOICE', 'FILE', 'LOCATION', 'BID', 'VIDEO'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        error: 'نوع الرسالة غير صحيح',
      });
    }

    // إنشاء أو جلب المحادثة تلقائياً إذا لم تكن موجودة
    let finalConversationId = conversationId;
    let extractedReceiverId = receiverId;

    // 🆕 معالجة المحادثات المؤقتة (temp-userId-timestamp)
    // يتم إنشاؤها في الواجهة عند بدء محادثة جديدة مع مستخدم
    if (conversationId && String(conversationId).startsWith('temp-')) {
      console.log('[API Messages] 🔄 محادثة مؤقتة مكتشفة:', conversationId);
      // استخراج معرف المستخدم المستهدف من المعرف المؤقت
      // الشكل: temp-{userId}-{timestamp}
      const parts = String(conversationId).split('-');
      if (parts.length >= 2) {
        extractedReceiverId = parts[1]; // الجزء الثاني هو معرف المستخدم
        console.log('[API Messages] 📋 استخراج معرف المستقبل:', extractedReceiverId);
      }
      finalConversationId = null; // إعادة تعيين لإجبار إنشاء محادثة حقيقية
    }

    if (!finalConversationId && (receiverId || extractedReceiverId)) {
      const targetReceiverId = extractedReceiverId || receiverId;
      try {
        console.log('[API Messages] 🔄 إنشاء/جلب محادثة بين:', senderId, 'و', targetReceiverId);
        // إنشاء أو جلب محادثة مباشرة بين المرسل والمستقبل
        const conversation = await dbHelpers.getOrCreateDirectConversation(
          senderId.toString(),
          targetReceiverId!.toString(),
        );
        finalConversationId = conversation.id;
        console.log('[API Messages] ✅ تم إنشاء/جلب محادثة:', finalConversationId);
      } catch (error) {
        console.error('[API Messages] ❌ خطأ في إنشاء المحادثة:', error);
        return res.status(500).json({
          success: false,
          error: 'فشل في إنشاء المحادثة',
          details: error instanceof Error ? error.message : String(error),
        });
      }
    }

    // 🔍 تشخيص: التحقق من conversationId النهائي
    if (!finalConversationId) {
      console.error('[API Messages] ❌ لا يوجد conversationId نهائي');
      return res.status(400).json({
        success: false,
        error: 'فشل في تحديد المحادثة',
      });
    }

    console.log('[API Messages] ✅ conversationId النهائي:', finalConversationId);

    // تشفير الرسائل الحساسة (التي تحتوي على معلومات شخصية)
    let processedContent = content.trim();
    let encryptionData = null;

    // فحص إذا كانت الرسالة تحتاج تشفير
    const needsEncryption =
      /(\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4})|(\+?\d{1,3}[-.\s]?\(?\d{1,3}\)?[-.\s]?\d{1,4}[-.\s]?\d{1,4}[-.\s]?\d{1,9})|(password|كلمة المرور|رقم سري)/i.test(
        content,
      );

    if (needsEncryption) {
      const encrypted = MessageEncryption.encrypt(processedContent);
      processedContent = encrypted.encrypted;
      encryptionData = {
        iv: encrypted.iv,
        tag: encrypted.tag,
        encrypted: true,
      };
    }

    // إنشاء الرسالة
    const messageData = {
      senderId: senderId.toString(),
      conversationId: finalConversationId,
      content: processedContent,
      type: type as 'TEXT' | 'IMAGE' | 'FILE' | 'LOCATION' | 'VOICE',
      status: 'SENT' as const,
      metadata: encryptionData ? JSON.stringify(encryptionData) : undefined,
    };

    // حفظ الرسالة في قاعدة البيانات
    const savedMessage = await dbHelpers.createMessage(messageData);
    console.log('[API Messages] ✅ تم حفظ الرسالة:', savedMessage.id);

    if (savedMessage) {
      // إرسال إشعار للمستقبل (في التطبيق الحقيقي)
      if (receiverId) {
        await sendNotificationToReceiver(receiverId, senderId, content, type);
      }

      // بث الرسالة الجديدة عبر Socket.IO لغرفة المحادثة
      try {
        const io = res.socket?.server?.io as SocketIOServer<
          ServerToClientEvents,
          ClientToServerEvents,
          Record<string, never>,
          SocketData
        >;
        if (io && finalConversationId) {
          // استخدم محتوى قابل للقراءة للبث عبر Socket حتى لو خُزّن مشفّراً في قاعدة البيانات
          const emittedContent = needsEncryption ? content.trim() : processedContent;
          const mappedType: 'text' | 'image' | 'location' | 'file' | 'voice' | 'bid' | 'video' =
            type === 'IMAGE'
              ? 'image'
              : type === 'LOCATION'
                ? 'location'
                : type === 'FILE'
                  ? 'file'
                  : type === 'VOICE'
                    ? 'voice'
                    : type === 'BID'
                      ? 'bid'
                      : type === 'VIDEO'
                        ? 'video'
                        : 'text';

          // بث الرسالة لغرفة المحادثة
          console.log('[API Messages] 🔊 بث رسالة عبر Socket:', {
            type: mappedType,
            conversationId: String(finalConversationId),
            room: `chat:${finalConversationId}`,
            messageId: String(savedMessage.id),
          });

          io.to(`chat:${finalConversationId}`).emit('chat:message:new', {
            conversationId: String(finalConversationId),
            message: {
              id: String(savedMessage.id),
              senderId: String(senderId),
              type: mappedType,
              content: emittedContent,
              createdAt: new Date().toISOString(),
              status: 'sent',
              imageUrl: type === 'IMAGE' ? emittedContent : undefined,
            },
          });

          // بث مباشر للمستقبل حتى لو لم ينضم للغرفة (Enterprise server helper)
          try {
            if (receiverId) {
              enterpriseSocketServer.emitToUser('' + receiverId, 'chat:message:new', {
                conversationId: String(finalConversationId),
                message: {
                  id: String(savedMessage.id),
                  senderId: String(senderId),
                  content: emittedContent,
                  type: mappedType as any, // متوافق مع أنواع الخادم (text | image | ...)
                  createdAt: new Date().toISOString(),
                  status: 'sent',
                  imageUrl: type === 'IMAGE' ? emittedContent : undefined,
                },
              } as any);
            }
          } catch (_) {
            // تجاهل أخطاء البث المباشر
          }

          // 🔔 بث تحديث عداد الرسائل للمستقبل فقط
          if (receiverId) {
            (io as any).emit('messages:unread-update', {
              userId: String(receiverId),
              increment: 1,
            });
          }
        }
      } catch (_) {
        // ignore socket errors
      }

      console.log('[API Messages] 🎉 نجح إرسال الرسالة بالكامل');
      return res.status(201).json({
        success: true,
        message: 'تم إرسال الرسالة بنجاح',
        data: {
          ...savedMessage,
          conversationId: finalConversationId,
        },
      });
    } else {
      console.error('[API Messages] ❌ فشل حفظ الرسالة - savedMessage is null');
      return res.status(500).json({
        success: false,
        error: 'فشل في حفظ الرسالة',
      });
    }
  } catch (error) {
    console.error('[API Messages] ❌ خطأ حرج في إرسال الرسالة:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return res.status(500).json({
      success: false,
      error: 'فشل في إرسال الرسالة',
      details: errorMessage,
    });
  }
}

// ملاحظة: إنشاء المحادثة متوفر عبر endpoint مخصص في `pages/api/conversations.ts`

// تحديث رسالة
async function updateMessage(req: NextApiRequest, res: NextApiResponse, authUserId: string) {
  try {
    const { messageId, userId, action, conversationId } = req.body;

    if (!messageId && !conversationId) {
      return res.status(400).json({
        success: false,
        error: 'معرف الرسالة أو معرف المحادثة مطلوب',
      });
    }

    if (action === 'markAsRead') {
      // تحديث حالة الرسالة إلى مقروءة
      const targetConversationId = conversationId || messageId; // توافق قديم
      const uid = String(authUserId || userId);
      const updatedCount = await dbHelpers.markMessagesAsRead(targetConversationId, uid);

      // بث إيصال القراءة لغرفة المحادثة
      try {
        const io = res.socket?.server?.io as SocketIOServer<
          ServerToClientEvents,
          ClientToServerEvents,
          Record<string, never>,
          SocketData
        >;
        if (io && targetConversationId) {
          (io as any).to(`chat:${targetConversationId}`).emit('chat:messages:read', {
            conversationId: String(targetConversationId),
            readerId: uid,
            readAt: new Date().toISOString(),
          });

          // 🔔 بث تحديث عداد الرسائل - تقليل العداد
          (io as any).emit('messages:unread-update', {
            userId: uid,
            decrement: updatedCount,
          });
        }
      } catch (_) {
        // ignore socket errors
      }

      return res.status(200).json({
        success: true,
        message: 'تم تحديث حالة الرسالة',
        data: { updatedCount },
      });
    }

    return res.status(400).json({
      success: false,
      error: 'إجراء غير صحيح',
    });
  } catch (error) {
    console.error('خطأ في تحديث الرسالة:', error);
    return res.status(500).json({
      success: false,
      error: 'فشل في تحديث الرسالة',
    });
  }
}

// حذف رسالة
async function deleteMessage(req: NextApiRequest, res: NextApiResponse, authUserId: string) {
  try {
    const { messageId, userId } = req.body;

    if (!messageId || !userId) {
      return res.status(400).json({
        success: false,
        error: 'معرف الرسالة ومعرف المستخدم مطلوبان',
      });
    }

    const deleted = await dbHelpers.deleteMessage(messageId, String(authUserId || userId));

    if (deleted) {
      return res.status(200).json({
        success: true,
        message: 'تم حذف الرسالة بنجاح',
      });
    } else {
      return res.status(404).json({
        success: false,
        error: 'الرسالة غير موجودة أو لا يمكن حذفها',
      });
    }
  } catch (error) {
    console.error('خطأ في حذف الرسالة:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'فشل في حذف الرسالة',
    });
  }
}

// دالة لإرسال إشعار للمستقبل
async function sendNotificationToReceiver(
  _receiverId: string,
  _senderId: string,
  _content: string,
  _type: string,
) {
  try {
    // إرسال إشعار حقيقي للمستقبل

    // TODO: تنفيذ إرسال الإشعارات الحقيقية:
    // - Push notification
    // - إشعار داخل التطبيق
    // - إشعار عبر البريد الإلكتروني (للرسائل المهمة)

    // حفظ الإشعار في قاعدة البيانات
    // في التطبيق الحقيقي: حفظ/إرسال إشعار للمستقبل (Push/WebSocket/Email)
    return true;
  } catch (error) {
    console.error('خطأ في إرسال الإشعار:', error);
    return false;
  }
}
// دالة مساعدة لتحويل نوع الرسالة إلى نص عربي (غير مستخدمة حالياً)
function _getMessageTypeText(type: string): string {
  switch (type) {
    case 'TEXT':
      return 'رسالة نصية';
    case 'IMAGE':
      return 'صورة';
    case 'VOICE':
      return 'رسالة صوتية';
    case 'FILE':
      return 'ملف';
    case 'LOCATION':
      return 'موقع';
    case 'BID':
      return 'مزايدة';
    case 'VIDEO':
      return 'فيديو';
    default:
      return 'رسالة';
  }
}

// تطبيق Rate Limiting للحماية من الإساءة
export default withApiRateLimit(handler, {
  maxAttempts: 60, // 60 طلب في الدقيقة
  windowMs: 60 * 1000,
});
