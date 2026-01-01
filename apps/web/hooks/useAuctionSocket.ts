/**
 * React Hook for Auction Socket Integration
 * React Hook للتكامل مع Socket.IO للمزادات المباشرة
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import { getSocketManager, SocketManager } from '../utils/socketManager';
import {
  AuctionState,
  BidData,
  SocketUser,
  ConnectionState,
  AuctionParticipant,
} from '../types/socket';

export interface UseAuctionSocketOptions {
  auctionId: string;
  userToken: string;
  autoConnect?: boolean;
  onBidPlaced?: (bid: BidData & { user: SocketUser }) => void;
  onBidRejected?: (data: { reason: string; bidAmount: number; minimumRequired: number }) => void;
  onOutbid?: (data: { newBid: BidData & { user: SocketUser }; yourPreviousBid: number }) => void;
  onAuctionEnded?: (data: {
    auction: AuctionState;
    winner: SocketUser | null;
    finalPrice: number;
  }) => void;
  onError?: (error: { code: string; message: string }) => void;
}

export interface AuctionSocketState {
  // Connection state
  isConnected: boolean;
  connectionState: ConnectionState;

  // Auction state
  auction: AuctionState | null;
  participants: AuctionParticipant[];
  recentBids: (BidData & { user: SocketUser })[];

  // User interaction state
  isJoined: boolean;
  isPlacingBid: boolean;
  lastBidError: string | null;

  // Real-time updates
  timeRemaining: number;
  isEndingSoon: boolean;
}

export interface AuctionSocketActions {
  // Connection actions
  connect: () => Promise<void>;
  disconnect: () => void;

  // Auction actions
  joinAuction: () => Promise<{ success: boolean; error?: string }>;
  leaveAuction: () => void;

  // Bidding actions
  placeBid: (amount: number) => Promise<{ success: boolean; error?: string }>;

  // Utility actions
  clearError: () => void;
  refreshAuction: () => Promise<void>;
}

export function useAuctionSocket(
  options: UseAuctionSocketOptions,
): [AuctionSocketState, AuctionSocketActions] {
  const {
    auctionId,
    userToken,
    autoConnect = true,
    onBidPlaced,
    onBidRejected,
    onOutbid,
    onAuctionEnded,
    onError,
  } = options;

  // State management
  const [state, setState] = useState<AuctionSocketState>({
    isConnected: false,
    connectionState: 'disconnected',
    auction: null,
    participants: [],
    recentBids: [],
    isJoined: false,
    isPlacingBid: false,
    lastBidError: null,
    timeRemaining: 0,
    isEndingSoon: false,
  });

  // Refs for stable references
  const socketManagerRef = useRef<SocketManager | null>(null);
  const timeRemainingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const callbacksRef = useRef({
    onBidPlaced,
    onBidRejected,
    onOutbid,
    onAuctionEnded,
    onError,
  });

  // Update callbacks ref when they change
  useEffect(() => {
    callbacksRef.current = {
      onBidPlaced,
      onBidRejected,
      onOutbid,
      onAuctionEnded,
      onError,
    };
  }, [onBidPlaced, onBidRejected, onOutbid, onAuctionEnded, onError]);

  // Initialize socket manager
  useEffect(() => {
    if (typeof window === 'undefined') return; // SSR check

    try {
      socketManagerRef.current = getSocketManager();

      // Set up connection state callback
      socketManagerRef.current.setConnectionChangeCallback((connectionState: ConnectionState) => {
        setState((prev) => ({
          ...prev,
          connectionState,
          isConnected: connectionState === 'connected',
        }));
      });

      // Set up error callback
      socketManagerRef.current.setErrorCallback((error) => {
        setState((prev) => ({ ...prev, lastBidError: error.message }));
        callbacksRef.current.onError?.(error);
      });

      // Auto connect if enabled
      if (autoConnect) {
        connect();
      }
    } catch (error) {
      console.error('خطأ في تهيئة Socket Manager:', error);
      callbacksRef.current.onError?.({
        code: 'INIT_ERROR',
        message: 'فشل في تهيئة الاتصال',
      });
    }

    return () => {
      // Cleanup on unmount
      if (timeRemainingIntervalRef.current) {
        clearInterval(timeRemainingIntervalRef.current);
      }
    };
  }, [autoConnect]);

  // Set up socket event listeners
  useEffect(() => {
    const socketManager = socketManagerRef.current;
    if (!socketManager) return;

    // Auction joined
    const handleAuctionJoined = (data: {
      auction: AuctionState;
      participants: AuctionParticipant[];
      recentBids: (BidData & { user: SocketUser })[];
    }) => {
      setState((prev) => ({
        ...prev,
        auction: data.auction,
        participants: data.participants,
        recentBids: data.recentBids,
        isJoined: true,
        lastBidError: null,
      }));

      startTimeRemainingUpdate(data.auction.endTime);
    };

    // Bid placed
    const handleBidPlaced = (bid: BidData & { user: SocketUser }) => {
      setState((prev) => ({
        ...prev,
        recentBids: [bid, ...prev.recentBids.slice(0, 9)], // Keep last 10 bids
        auction: prev.auction
          ? {
              ...prev.auction,
              currentPrice: bid.amount,
              lastBidder: bid.user,
            }
          : null,
        isPlacingBid: false,
        lastBidError: null,
      }));

      callbacksRef.current.onBidPlaced?.(bid);
    };

    // Bid rejected
    const handleBidRejected = (data: {
      reason: string;
      bidAmount: number;
      minimumRequired: number;
    }) => {
      setState((prev) => ({
        ...prev,
        isPlacingBid: false,
        lastBidError: data.reason,
      }));

      callbacksRef.current.onBidRejected?.(data);
    };

    // Outbid
    const handleOutbid = (data: {
      newBid: BidData & { user: SocketUser };
      yourPreviousBid: number;
    }) => {
      setState((prev) => ({
        ...prev,
        recentBids: [data.newBid, ...prev.recentBids.slice(0, 9)],
        auction: prev.auction
          ? {
              ...prev.auction,
              currentPrice: data.newBid.amount,
              lastBidder: data.newBid.user,
            }
          : null,
      }));

      callbacksRef.current.onOutbid?.(data);
    };

    // Auction state updated
    const handleAuctionStateUpdated = (auction: AuctionState) => {
      setState((prev) => ({
        ...prev,
        auction,
        isEndingSoon: auction.status === 'ENDING_SOON',
      }));
    };

    // Auction ending soon
    const handleAuctionEndingSoon = (data: { auction: AuctionState; remainingSeconds: number }) => {
      setState((prev) => ({
        ...prev,
        auction: data.auction,
        isEndingSoon: true,
        timeRemaining: data.remainingSeconds * 1000,
      }));
    };

    // Auction ended
    const handleAuctionEnded = (data: {
      auction: AuctionState;
      winner: SocketUser | null;
      finalPrice: number;
    }) => {
      setState((prev) => ({
        ...prev,
        auction: data.auction,
        isEndingSoon: false,
        timeRemaining: 0,
      }));

      if (timeRemainingIntervalRef.current) {
        clearInterval(timeRemainingIntervalRef.current);
        timeRemainingIntervalRef.current = null;
      }

      callbacksRef.current.onAuctionEnded?.(data);
    };

    // Participants updated
    const handleParticipantsUpdated = (participants: AuctionParticipant[]) => {
      setState((prev) => ({
        ...prev,
        participants,
        auction: prev.auction
          ? {
              ...prev.auction,
              participantsCount: participants.length,
            }
          : null,
      }));
    };

    // Register event listeners
    socketManager.on('auction:joined', handleAuctionJoined);
    socketManager.on('bid:placed', handleBidPlaced);
    socketManager.on('bid:rejected', handleBidRejected);
    socketManager.on('bid:outbid', handleOutbid);
    socketManager.on('auction:state-updated', handleAuctionStateUpdated);
    socketManager.on('auction:ending-soon', handleAuctionEndingSoon);
    socketManager.on('auction:ended', handleAuctionEnded);
    socketManager.on('participants:updated', handleParticipantsUpdated);

    return () => {
      // Cleanup event listeners
      socketManager.off('auction:joined', handleAuctionJoined);
      socketManager.off('bid:placed', handleBidPlaced);
      socketManager.off('bid:rejected', handleBidRejected);
      socketManager.off('bid:outbid', handleOutbid);
      socketManager.off('auction:state-updated', handleAuctionStateUpdated);
      socketManager.off('auction:ending-soon', handleAuctionEndingSoon);
      socketManager.off('auction:ended', handleAuctionEnded);
      socketManager.off('participants:updated', handleParticipantsUpdated);
    };
  }, []);

  // Time remaining update function
  const startTimeRemainingUpdate = useCallback((endTime: number) => {
    if (timeRemainingIntervalRef.current) {
      clearInterval(timeRemainingIntervalRef.current);
    }

    const updateTimeRemaining = () => {
      const now = Date.now();
      const remaining = Math.max(0, endTime - now);

      setState((prev) => ({
        ...prev,
        timeRemaining: remaining,
        isEndingSoon: remaining <= 5 * 60 * 1000 && remaining > 0, // Last 5 minutes
      }));

      if (remaining <= 0) {
        if (timeRemainingIntervalRef.current) {
          clearInterval(timeRemainingIntervalRef.current);
          timeRemainingIntervalRef.current = null;
        }
      }
    };

    updateTimeRemaining(); // Initial update
    timeRemainingIntervalRef.current = setInterval(updateTimeRemaining, 1000);
  }, []);

  // Actions
  const connect = useCallback(async (): Promise<void> => {
    const socketManager = socketManagerRef.current;
    if (!socketManager) {
      throw new Error('Socket manager not initialized');
    }

    // The socket manager handles connection automatically
    // We just need to wait for it to connect
    return new Promise((resolve, reject) => {
      const checkConnection = () => {
        if (socketManager.isConnected()) {
          resolve();
        } else if (socketManager.getConnectionState() === 'error') {
          reject(new Error('Connection failed'));
        } else {
          setTimeout(checkConnection, 100);
        }
      };

      setTimeout(() => reject(new Error('Connection timeout')), 10000);
      checkConnection();
    });
  }, []);

  const disconnect = useCallback((): void => {
    const socketManager = socketManagerRef.current;
    if (socketManager) {
      socketManager.disconnect();
    }

    setState((prev) => ({
      ...prev,
      isConnected: false,
      connectionState: 'disconnected',
      isJoined: false,
      auction: null,
      participants: [],
      recentBids: [],
    }));

    if (timeRemainingIntervalRef.current) {
      clearInterval(timeRemainingIntervalRef.current);
      timeRemainingIntervalRef.current = null;
    }
  }, []);

  const joinAuction = useCallback(async (): Promise<{
    success: boolean;
    error?: string;
  }> => {
    const socketManager = socketManagerRef.current;
    if (!socketManager || !socketManager.isConnected()) {
      return { success: false, error: 'Not connected to server' };
    }

    try {
      const result = await socketManager.joinAuction(auctionId, userToken);
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return { success: false, error: errorMessage };
    }
  }, [auctionId, userToken]);

  const leaveAuction = useCallback((): void => {
    const socketManager = socketManagerRef.current;
    if (socketManager && state.isJoined) {
      socketManager.leaveAuction(auctionId);
      setState((prev) => ({ ...prev, isJoined: false }));
    }
  }, [auctionId, state.isJoined]);

  const placeBid = useCallback(
    async (amount: number): Promise<{ success: boolean; error?: string }> => {
      const socketManager = socketManagerRef.current;
      if (!socketManager || !socketManager.isConnected()) {
        return { success: false, error: 'Not connected to server' };
      }

      if (!state.isJoined) {
        return { success: false, error: 'Not joined to auction' };
      }

      if (state.isPlacingBid) {
        return { success: false, error: 'Already placing a bid' };
      }

      setState((prev) => ({ ...prev, isPlacingBid: true, lastBidError: null }));

      try {
        const result = await socketManager.placeBid(auctionId, amount);

        if (!result.success) {
          setState((prev) => ({
            ...prev,
            isPlacingBid: false,
            lastBidError: result.error || 'Bid failed',
          }));
        }

        return result;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        setState((prev) => ({
          ...prev,
          isPlacingBid: false,
          lastBidError: errorMessage,
        }));
        return { success: false, error: errorMessage };
      }
    },
    [auctionId, state.isJoined, state.isPlacingBid],
  );

  const clearError = useCallback((): void => {
    setState((prev) => ({ ...prev, lastBidError: null }));
  }, []);

  const refreshAuction = useCallback(async (): Promise<void> => {
    if (state.isJoined) {
      // Re-join to refresh state
      await joinAuction();
    }
  }, [state.isJoined, joinAuction]);

  // Return state and actions
  return [
    state,
    {
      connect,
      disconnect,
      joinAuction,
      leaveAuction,
      placeBid,
      clearError,
      refreshAuction,
    },
  ];
}
