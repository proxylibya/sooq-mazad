/**
 * Auction WebSocket Handler
 * معالج WebSocket للمزايدات الحية
 */

const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'sooq-mazad-secret-2024';

// تخزين معلومات المزادات النشطة في الذاكرة
const activeAuctions = new Map();
const userSockets = new Map();

class AuctionHandler {
  constructor(io) {
    this.io = io;
    this.setupHandlers();
  }

  setupHandlers() {
    // Middleware للمصادقة
    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token;
        
        if (!token) {
          return next(new Error('غير مصرح'));
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        socket.userId = decoded.userId;
        socket.userRole = decoded.role;
        socket.userName = socket.handshake.auth.userName || 'مستخدم';
        
        next();
      } catch (error) {
        next(new Error('رمز غير صالح'));
      }
    });

    // معالجة الاتصال
    this.io.on('connection', (socket) => {
      console.log(`User ${socket.userId} connected`);
      
      // حفظ socket ID للمستخدم
      userSockets.set(socket.userId, socket.id);
      
      // معالجات الأحداث
      this.handleJoinAuction(socket);
      this.handleLeaveAuction(socket);
      this.handlePlaceBid(socket);
      this.handleGetAuctionInfo(socket);
      this.handleStartWatching(socket);
      this.handleStopWatching(socket);
      this.handleSendMessage(socket);
      this.handleTyping(socket);
      this.handleDisconnect(socket);
    });
  }

  // الانضمام إلى مزاد
  handleJoinAuction(socket) {
    socket.on('auction:join', async (data) => {
      const { auctionId } = data;
      
      if (!auctionId) {
        return socket.emit('error', { message: 'معرف المزاد مطلوب' });
      }

      // الانضمام إلى غرفة المزاد
      const roomName = `auction:${auctionId}`;
      socket.join(roomName);
      
      // إضافة المستخدم للمزاد النشط
      if (!activeAuctions.has(auctionId)) {
        activeAuctions.set(auctionId, {
          id: auctionId,
          participants: new Set(),
          watchers: new Set(),
          bids: [],
          messages: [],
          startTime: Date.now()
        });
      }
      
      const auction = activeAuctions.get(auctionId);
      auction.participants.add(socket.userId);
      
      // إرسال معلومات المزاد للمستخدم
      socket.emit('auction:joined', {
        auctionId,
        participants: auction.participants.size,
        watchers: auction.watchers.size,
        recentBids: auction.bids.slice(-10),
        recentMessages: auction.messages.slice(-20)
      });
      
      // إعلام الآخرين بالانضمام
      socket.to(roomName).emit('auction:user-joined', {
        userId: socket.userId,
        userName: socket.userName,
        timestamp: new Date()
      });
      
      console.log(`User ${socket.userId} joined auction ${auctionId}`);
    });
  }

  // مغادرة المزاد
  handleLeaveAuction(socket) {
    socket.on('auction:leave', (data) => {
      const { auctionId } = data;
      
      if (!auctionId) return;
      
      const roomName = `auction:${auctionId}`;
      socket.leave(roomName);
      
      // إزالة المستخدم من المزاد
      const auction = activeAuctions.get(auctionId);
      if (auction) {
        auction.participants.delete(socket.userId);
        auction.watchers.delete(socket.userId);
        
        // إعلام الآخرين بالمغادرة
        socket.to(roomName).emit('auction:user-left', {
          userId: socket.userId,
          userName: socket.userName,
          timestamp: new Date()
        });
      }
      
      console.log(`User ${socket.userId} left auction ${auctionId}`);
    });
  }

  // وضع مزايدة
  handlePlaceBid(socket) {
    socket.on('auction:bid', async (data) => {
      const { auctionId, amount } = data;
      
      if (!auctionId || !amount) {
        return socket.emit('error', { message: 'البيانات غير كاملة' });
      }

      try {
        // التحقق من صحة المزايدة (يمكن الاتصال بقاعدة البيانات هنا)
        const bidData = {
          id: Date.now().toString(),
          userId: socket.userId,
          userName: socket.userName,
          amount: parseFloat(amount),
          timestamp: new Date(),
          status: 'ACTIVE'
        };

        // حفظ المزايدة
        const auction = activeAuctions.get(auctionId);
        if (auction) {
          auction.bids.push(bidData);
          
          // الاحتفاظ بآخر 100 مزايدة فقط في الذاكرة
          if (auction.bids.length > 100) {
            auction.bids = auction.bids.slice(-100);
          }
        }

        const roomName = `auction:${auctionId}`;
        
        // إعلام جميع المشاركين بالمزايدة الجديدة
        this.io.to(roomName).emit('auction:new-bid', {
          bid: bidData,
          totalBids: auction ? auction.bids.length : 1,
          highestBid: amount,
          auctionId
        });

        // تأكيد للمزايد
        socket.emit('auction:bid-placed', {
          success: true,
          bid: bidData
        });

        // إرسال إشعار للبائع إذا كان متصل
        this.sendNotificationToSeller(auctionId, {
          type: 'NEW_BID',
          message: `مزايدة جديدة بقيمة ${amount} دينار`,
          bidder: socket.userName,
          timestamp: new Date()
        });

        console.log(`New bid: ${amount} on auction ${auctionId} by user ${socket.userId}`);
      } catch (error) {
        console.error('Bid error:', error);
        socket.emit('auction:bid-error', {
          message: error.message || 'خطأ في تسجيل المزايدة'
        });
      }
    });
  }

  // الحصول على معلومات المزاد
  handleGetAuctionInfo(socket) {
    socket.on('auction:get-info', (data) => {
      const { auctionId } = data;
      
      if (!auctionId) {
        return socket.emit('error', { message: 'معرف المزاد مطلوب' });
      }

      const auction = activeAuctions.get(auctionId);
      
      if (!auction) {
        return socket.emit('auction:info', {
          auctionId,
          participants: 0,
          watchers: 0,
          bids: [],
          messages: []
        });
      }

      socket.emit('auction:info', {
        auctionId,
        participants: auction.participants.size,
        watchers: auction.watchers.size,
        recentBids: auction.bids.slice(-10),
        recentMessages: auction.messages.slice(-20),
        highestBid: auction.bids.length > 0 
          ? Math.max(...auction.bids.map(b => b.amount))
          : 0
      });
    });
  }

  // بدء مشاهدة المزاد (بدون مشاركة)
  handleStartWatching(socket) {
    socket.on('auction:watch', (data) => {
      const { auctionId } = data;
      
      if (!auctionId) return;
      
      const roomName = `auction:${auctionId}`;
      socket.join(roomName);
      
      const auction = activeAuctions.get(auctionId);
      if (auction) {
        auction.watchers.add(socket.userId);
        
        // إرسال تحديث عدد المشاهدين
        this.io.to(roomName).emit('auction:watchers-update', {
          count: auction.watchers.size
        });
      }
      
      console.log(`User ${socket.userId} watching auction ${auctionId}`);
    });
  }

  // إيقاف مشاهدة المزاد
  handleStopWatching(socket) {
    socket.on('auction:unwatch', (data) => {
      const { auctionId } = data;
      
      if (!auctionId) return;
      
      const auction = activeAuctions.get(auctionId);
      if (auction) {
        auction.watchers.delete(socket.userId);
        
        const roomName = `auction:${auctionId}`;
        this.io.to(roomName).emit('auction:watchers-update', {
          count: auction.watchers.size
        });
      }
    });
  }

  // إرسال رسالة في المزاد
  handleSendMessage(socket) {
    socket.on('auction:message', (data) => {
      const { auctionId, message } = data;
      
      if (!auctionId || !message) {
        return socket.emit('error', { message: 'البيانات غير كاملة' });
      }

      const messageData = {
        id: Date.now().toString(),
        userId: socket.userId,
        userName: socket.userName,
        message: message.substring(0, 500), // حد أقصى 500 حرف
        timestamp: new Date()
      };

      const auction = activeAuctions.get(auctionId);
      if (auction) {
        auction.messages.push(messageData);
        
        // الاحتفاظ بآخر 50 رسالة فقط
        if (auction.messages.length > 50) {
          auction.messages = auction.messages.slice(-50);
        }
      }

      const roomName = `auction:${auctionId}`;
      this.io.to(roomName).emit('auction:new-message', messageData);
    });
  }

  // الكتابة في المزاد
  handleTyping(socket) {
    socket.on('auction:typing', (data) => {
      const { auctionId, isTyping } = data;
      
      if (!auctionId) return;
      
      const roomName = `auction:${auctionId}`;
      socket.to(roomName).emit('auction:user-typing', {
        userId: socket.userId,
        userName: socket.userName,
        isTyping
      });
    });
  }

  // معالجة قطع الاتصال
  handleDisconnect(socket) {
    socket.on('disconnect', () => {
      // إزالة من خريطة المستخدمين
      userSockets.delete(socket.userId);
      
      // إزالة من جميع المزادات
      activeAuctions.forEach((auction, auctionId) => {
        if (auction.participants.has(socket.userId)) {
          auction.participants.delete(socket.userId);
          
          const roomName = `auction:${auctionId}`;
          socket.to(roomName).emit('auction:user-disconnected', {
            userId: socket.userId,
            userName: socket.userName
          });
        }
        
        auction.watchers.delete(socket.userId);
      });
      
      console.log(`User ${socket.userId} disconnected`);
    });
  }

  // إرسال إشعار للبائع
  async sendNotificationToSeller(auctionId, notification) {
    // يمكن الحصول على معرف البائع من قاعدة البيانات
    // هذا مجرد مثال
    const sellerSocketId = userSockets.get('sellerId');
    if (sellerSocketId) {
      this.io.to(sellerSocketId).emit('notification', notification);
    }
  }

  // إنهاء المزاد
  endAuction(auctionId) {
    const auction = activeAuctions.get(auctionId);
    if (!auction) return;

    const roomName = `auction:${auctionId}`;
    
    // تحديد الفائز
    const highestBid = auction.bids.reduce((max, bid) => 
      bid.amount > max.amount ? bid : max, 
      { amount: 0 }
    );

    // إعلام جميع المشاركين
    this.io.to(roomName).emit('auction:ended', {
      auctionId,
      winner: highestBid.userId ? {
        userId: highestBid.userId,
        userName: highestBid.userName,
        amount: highestBid.amount
      } : null,
      totalBids: auction.bids.length,
      endTime: new Date()
    });

    // تنظيف
    activeAuctions.delete(auctionId);
    
    // فصل جميع المستخدمين من الغرفة
    this.io.socketsLeave(roomName);
  }

  // الحصول على إحصائيات المزاد
  getAuctionStats(auctionId) {
    const auction = activeAuctions.get(auctionId);
    if (!auction) return null;

    return {
      participants: auction.participants.size,
      watchers: auction.watchers.size,
      totalBids: auction.bids.length,
      highestBid: auction.bids.length > 0 
        ? Math.max(...auction.bids.map(b => b.amount))
        : 0,
      duration: Date.now() - auction.startTime,
      messages: auction.messages.length
    };
  }
}

module.exports = AuctionHandler;
