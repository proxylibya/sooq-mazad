# نظام المراسلة الموحد - Sooq Mazad

نظام مراسلة متكامل على طراز واتساب يدعم الرسائل النصية، الصوتية، والمكالمات الصوتية والفيديو.

## 📋 المحتويات

1. [نظرة عامة](#نظرة-عامة)
2. [البنية والملفات](#البنية-والملفات)
3. [طريقة الاستخدام](#طريقة-الاستخدام)
4. [APIs المتاحة](#apis-المتاحة)
5. [المكونات](#المكونات)
6. [الخدمات](#الخدمات)
7. [قاعدة البيانات](#قاعدة-البيانات)
8. [أمثلة عملية](#أمثلة-عملية)

---

## نظرة عامة

نظام المراسلة الموحد يوفر:

- ✅ رسائل نصية فورية
- ✅ رسائل صوتية
- ✅ إرسال الصور
- ✅ إرسال الموقع
- ✅ مكالمات صوتية (WebRTC)
- ✅ مكالمات فيديو (WebRTC)
- ✅ حالة الكتابة (typing indicator)
- ✅ حالة التسليم والقراءة
- ✅ إشعارات المكالمات الواردة

---

## البنية والملفات

### الملفات الأساسية

```
apps/web/
├── lib/messaging/
│   ├── unified-messaging-system.ts    # خدمة المراسلة الرئيسية
│   └── webrtc-service.ts              # خدمة WebRTC للمكالمات
├── components/chat/
│   ├── WhatsAppStyleChat.tsx          # واجهة الدردشة
│   ├── CallModal.tsx                  # نافذة المكالمات
│   └── index.ts                       # التصدير الموحد
├── hooks/
│   └── useChat.ts                     # Hook للدردشة
└── pages/api/
    ├── calls/
    │   ├── index.ts                   # بدء/جلب المكالمات
    │   └── [callId]/
    │       ├── answer.ts              # الرد على مكالمة
    │       ├── end.ts                 # إنهاء مكالمة
    │       └── decline.ts             # رفض مكالمة
    └── messages/
        └── upload-voice.ts            # رفع رسالة صوتية
```

---

## طريقة الاستخدام

### 1. استخدام Hook للدردشة

```tsx
import { useChat } from '@/hooks/useChat';

function ChatPage() {
  const {
    messages,
    sendTextMessage,
    sendVoiceMessage,
    sendImage,
    sendLocation,
    startVoiceCall,
    startVideoCall,
    callState,
    isTyping,
    sendTyping,
  } = useChat({
    conversationId: 'conv-123',
    // أو
    otherUserId: 'user-456',
  });

  return (
    <div>
      {/* عرض الرسائل */}
      {messages.map((msg) => (
        <div key={msg.id}>{msg.content}</div>
      ))}

      {/* إرسال رسالة */}
      <button onClick={() => sendTextMessage('مرحباً!')}>إرسال</button>

      {/* بدء مكالمة */}
      <button onClick={startVoiceCall}>مكالمة صوتية</button>
      <button onClick={startVideoCall}>مكالمة فيديو</button>
    </div>
  );
}
```

### 2. استخدام المكونات الجاهزة

```tsx
import { WhatsAppStyleChat, CallModal, useChat } from '@/components/chat';

function ChatPage() {
  const {
    messages,
    sendTextMessage,
    sendVoiceMessage,
    sendImage,
    sendLocation,
    callState,
    startVoiceCall,
    startVideoCall,
    answerCall,
    endCall,
    declineCall,
    toggleMute,
    toggleVideo,
    isTyping,
    sendTyping,
  } = useChat({ conversationId: 'conv-123' });

  const otherUser = {
    id: 'user-456',
    name: 'أحمد محمد',
    profileImage: '/avatar.jpg',
    isOnline: true,
  };

  return (
    <>
      <WhatsAppStyleChat
        conversationId="conv-123"
        currentUserId="my-user-id"
        otherUser={otherUser}
        messages={messages}
        onSendMessage={sendTextMessage}
        onSendVoice={sendVoiceMessage}
        onSendImage={sendImage}
        onSendLocation={sendLocation}
        onStartVoiceCall={startVoiceCall}
        onStartVideoCall={startVideoCall}
        isTyping={isTyping}
        onTyping={sendTyping}
      />

      <CallModal
        isOpen={callState.status !== 'idle'}
        callType={callState.type || 'VOICE'}
        callStatus={callState.status}
        isIncoming={callState.isIncoming}
        remoteUser={otherUser}
        duration={callState.duration}
        isMuted={callState.isMuted}
        isVideoEnabled={callState.isVideoEnabled}
        onAnswer={answerCall}
        onDecline={declineCall}
        onEnd={endCall}
        onToggleMute={toggleMute}
        onToggleVideo={toggleVideo}
      />
    </>
  );
}
```

---

## APIs المتاحة

### المكالمات

#### بدء مكالمة

```http
POST /api/calls
Content-Type: application/json

{
  "conversationId": "conv-123",
  "calleeId": "user-456",
  "type": "VOICE" | "VIDEO"
}
```

#### الرد على مكالمة

```http
POST /api/calls/[callId]/answer
```

#### إنهاء مكالمة

```http
POST /api/calls/[callId]/end
```

#### رفض مكالمة

```http
POST /api/calls/[callId]/decline
```

#### جلب سجل المكالمات

```http
GET /api/calls?conversationId=conv-123&limit=20
```

### الرسائل الصوتية

```http
POST /api/messages/upload-voice
Content-Type: multipart/form-data

audio: File
conversationId: string
duration: number (seconds)
```

---

## المكونات

### WhatsAppStyleChat

واجهة دردشة متكاملة على طراز واتساب.

**Props:**
| الخاصية | النوع | الوصف |
|---------|-------|-------|
| `conversationId` | `string` | معرف المحادثة |
| `currentUserId` | `string` | معرف المستخدم الحالي |
| `otherUser` | `User` | بيانات المستخدم الآخر |
| `messages` | `Message[]` | قائمة الرسائل |
| `onSendMessage` | `function` | إرسال رسالة نصية |
| `onSendVoice?` | `function` | إرسال رسالة صوتية |
| `onSendImage?` | `function` | إرسال صورة |
| `onSendLocation?` | `function` | إرسال موقع |
| `onStartVoiceCall?` | `function` | بدء مكالمة صوتية |
| `onStartVideoCall?` | `function` | بدء مكالمة فيديو |
| `isTyping?` | `boolean` | حالة الكتابة |
| `onTyping?` | `function` | إرسال حالة الكتابة |

### CallModal

نافذة المكالمات الصوتية والفيديو.

**Props:**
| الخاصية | النوع | الوصف |
|---------|-------|-------|
| `isOpen` | `boolean` | إظهار/إخفاء النافذة |
| `callType` | `'VOICE' \| 'VIDEO'` | نوع المكالمة |
| `callStatus` | `string` | حالة المكالمة |
| `isIncoming` | `boolean` | هل مكالمة واردة؟ |
| `remoteUser` | `User` | بيانات الطرف الآخر |
| `duration` | `number` | مدة المكالمة بالثواني |
| `isMuted` | `boolean` | حالة كتم الصوت |
| `isVideoEnabled` | `boolean` | حالة الفيديو |
| `onAnswer` | `function` | الرد على المكالمة |
| `onDecline` | `function` | رفض المكالمة |
| `onEnd` | `function` | إنهاء المكالمة |
| `onToggleMute` | `function` | كتم/إلغاء كتم |
| `onToggleVideo` | `function` | تشغيل/إيقاف الفيديو |

---

## الخدمات

### messagingSystem

خدمة المراسلة الرئيسية (Singleton).

```typescript
import { messagingSystem } from '@/lib/messaging/unified-messaging-system';

// تهيئة
messagingSystem.initialize(userId, token);

// المحادثات
await messagingSystem.getConversations();
await messagingSystem.getConversation(conversationId);
await messagingSystem.getOrCreateConversation(otherUserId);

// الرسائل
await messagingSystem.getMessages(conversationId);
await messagingSystem.sendTextMessage(conversationId, text);
await messagingSystem.sendVoiceMessage(conversationId, blob, duration);
await messagingSystem.sendImage(conversationId, file);
await messagingSystem.sendLocation(conversationId, lat, lng, address);

// الكتابة
messagingSystem.sendTyping(conversationId);
messagingSystem.stopTyping(conversationId);

// القراءة
await messagingSystem.markAsRead(conversationId);

// المكالمات
await messagingSystem.startCall(conversationId, calleeId, type);
await messagingSystem.answerCall(callId);
await messagingSystem.endCall(callId);
await messagingSystem.declineCall(callId);

// الأحداث
messagingSystem.on('message:new', handler);
messagingSystem.on('call:incoming', handler);
messagingSystem.on('typing', handler);
```

### webRTCService

خدمة WebRTC للمكالمات (Singleton).

```typescript
import { webRTCService } from '@/lib/messaging/webrtc-service';

// بدء مكالمة
await webRTCService.startCall(callId, remoteUserId, userName, 'VIDEO');

// الرد على مكالمة
await webRTCService.answerCall(offer);

// إنهاء/رفض
webRTCService.endCall();
webRTCService.declineCall();

// التحكم
webRTCService.toggleMute();
webRTCService.toggleVideo();
await webRTCService.switchCamera();

// الحالة
webRTCService.getState();
webRTCService.isInCall();

// البث
webRTCService.getLocalMediaStream();
webRTCService.getRemoteMediaStream();

// الأحداث
webRTCService.on('incoming', handler);
webRTCService.on('connected', handler);
webRTCService.on('ended', handler);
webRTCService.on('remoteStream', handler);
```

---

## قاعدة البيانات

### جدول المكالمات (calls)

```prisma
model calls {
  id             String     @id @default(cuid())
  conversationId String
  callerId       String
  calleeId       String
  type           CallType   @default(VOICE)
  status         CallStatus @default(RINGING)
  startedAt      DateTime?
  endedAt        DateTime?
  duration       Int?
  missedReason   String?
  metadata       Json?
  createdAt      DateTime   @default(now())
  updatedAt      DateTime   @updatedAt

  conversation   conversations @relation(...)
  caller         users         @relation("caller", ...)
  callee         users         @relation("callee", ...)
}
```

### أنواع الرسائل الجديدة

```prisma
enum MessageType {
  TEXT
  IMAGE
  FILE
  LOCATION
  VOICE
  VIDEO         # جديد
  BID
  CALL_STARTED  # جديد
  CALL_ENDED    # جديد
  CALL_MISSED   # جديد
}

enum CallType {
  VOICE
  VIDEO
}

enum CallStatus {
  RINGING
  ANSWERED
  ENDED
  MISSED
  DECLINED
  BUSY
  FAILED
}
```

---

## أمثلة عملية

### مثال 1: صفحة دردشة كاملة

```tsx
// pages/chat/[conversationId].tsx
import { useRouter } from 'next/router';
import { WhatsAppStyleChat, CallModal, useChat } from '@/components/chat';
import { webRTCService } from '@/lib/messaging/webrtc-service';
import useAuth from '@/hooks/useAuth';

export default function ChatPage() {
  const router = useRouter();
  const { conversationId } = router.query;
  const { user } = useAuth();

  const chat = useChat({
    conversationId: conversationId as string,
  });

  if (!chat.conversation) return <div>جاري التحميل...</div>;

  const otherUser = chat.conversation.participants.find((p) => p.id !== user?.id);

  return (
    <div className="h-screen">
      <WhatsAppStyleChat
        conversationId={chat.conversation.id}
        currentUserId={user?.id || ''}
        otherUser={otherUser || { id: '', name: 'مستخدم' }}
        messages={chat.messages}
        onSendMessage={async (text) => chat.sendTextMessage(text)}
        onSendVoice={chat.sendVoiceMessage}
        onSendImage={chat.sendImage}
        onSendLocation={chat.sendLocation}
        onStartVoiceCall={chat.startVoiceCall}
        onStartVideoCall={chat.startVideoCall}
        isTyping={chat.isTyping}
        onTyping={chat.sendTyping}
        onBack={() => router.back()}
      />

      <CallModal
        isOpen={chat.callState.status !== 'idle'}
        callType={chat.callState.type || 'VOICE'}
        callStatus={chat.callState.status}
        isIncoming={chat.callState.isIncoming}
        remoteUser={otherUser || { id: '', name: '' }}
        duration={chat.callState.duration}
        localStream={webRTCService.getLocalMediaStream()}
        remoteStream={webRTCService.getRemoteMediaStream()}
        isMuted={chat.callState.isMuted}
        isVideoEnabled={chat.callState.isVideoEnabled}
        onAnswer={chat.answerCall}
        onDecline={chat.declineCall}
        onEnd={chat.endCall}
        onToggleMute={chat.toggleMute}
        onToggleVideo={chat.toggleVideo}
      />
    </div>
  );
}
```

### مثال 2: زر بدء دردشة من أي مكان

```tsx
import { useRouter } from 'next/router';

function ContactButton({ userId, userName }: { userId: string; userName: string }) {
  const router = useRouter();

  const handleMessage = () => {
    // التوجيه لصفحة الرسائل مع معرف المستخدم
    router.push(`/messages?chat=${userId}&name=${encodeURIComponent(userName)}`);
  };

  return (
    <button
      onClick={handleMessage}
      className="flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-white hover:bg-emerald-600"
    >
      <ChatBubbleIcon className="h-5 w-5" />
      <span>مراسلة</span>
    </button>
  );
}
```

---

## 🔒 الأمان

- جميع APIs محمية بمصادقة JWT
- التحقق من المشاركة في المحادثة قبل الإرسال
- التحقق من صاحب المكالمة قبل الرد/الإنهاء
- تشفير WebRTC للمكالمات

---

## 🚀 الخطوات القادمة

1. [ ] إضافة دعم المجموعات
2. [ ] إضافة إشعارات Push للمكالمات
3. [ ] إضافة تسجيل المكالمات
4. [ ] إضافة مشاركة الشاشة
5. [ ] تحسين جودة الصوت والفيديو

---

## 📞 الدعم

للمساعدة أو الإبلاغ عن مشاكل، تواصل مع فريق التطوير.
