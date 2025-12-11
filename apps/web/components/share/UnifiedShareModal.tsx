'use client';

import CheckIcon from '@heroicons/react/24/outline/CheckIcon';
import EnvelopeIcon from '@heroicons/react/24/outline/EnvelopeIcon';
import LinkIcon from '@heroicons/react/24/outline/LinkIcon';
import QrCodeIcon from '@heroicons/react/24/outline/QrCodeIcon';
import ShareIcon from '@heroicons/react/24/outline/ShareIcon';
import XMarkIcon from '@heroicons/react/24/outline/XMarkIcon';
import React, { useCallback, useEffect, useState } from 'react';

// Types
export interface ShareData {
  title: string;
  description?: string;
  url: string;
  imageUrl?: string;
  hashtags?: string[];
}

export interface UnifiedShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  shareData: ShareData;
  onShareSuccess?: (platform: string) => void;
  onCopySuccess?: () => void;
  showQRCode?: boolean;
  className?: string;
}

interface SharePlatform {
  id: string;
  name: string;
  nameAr: string;
  icon: React.ReactNode;
  color: string;
  action: (data: ShareData) => void;
}

// Platform Icons
const WhatsAppIcon = () => (
  <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.7" />
  </svg>
);

const FacebookIcon = () => (
  <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

const XTwitterIcon = () => (
  <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const TelegramIcon = () => (
  <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
  </svg>
);

const LinkedInIcon = () => (
  <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
);

const MessengerIcon = () => (
  <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0C5.373 0 0 4.974 0 11.111c0 3.498 1.744 6.614 4.469 8.654V24l4.088-2.242c1.092.301 2.246.464 3.443.464 6.627 0 12-4.974 12-11.111S18.627 0 12 0zm1.191 14.963l-3.055-3.26-5.963 3.26L10.732 8l3.131 3.259L19.752 8l-6.561 6.963z" />
  </svg>
);

const SnapchatIcon = () => (
  <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12.206.793c.99 0 4.347.276 5.93 3.821.529 1.193.403 3.219.299 4.847l-.003.06c-.012.18-.022.345-.03.51.075.045.203.09.401.09.3-.016.659-.12 1.033-.301.165-.088.344-.104.464-.104.182 0 .359.029.509.09.45.149.734.479.734.838.015.449-.39.839-1.213 1.168-.089.029-.209.075-.344.119-.45.135-1.139.36-1.333.81-.09.224-.061.524.12.868l.015.015c.06.136 1.526 3.475 4.791 4.014.255.044.435.27.42.509 0 .075-.015.149-.045.225-.24.569-1.273.988-3.146 1.271-.059.091-.12.375-.164.57-.029.179-.074.36-.134.553-.076.271-.27.405-.555.405h-.03a3.2 3.2 0 01-.538-.074c-.36-.075-.765-.135-1.273-.135-.3 0-.599.015-.913.074-.6.104-1.123.464-1.723.884-.853.599-1.826 1.288-3.294 1.288-.06 0-.119-.015-.18-.015h-.149c-1.468 0-2.427-.675-3.279-1.288-.599-.42-1.107-.779-1.707-.884a5.8 5.8 0 00-.928-.074c-.54 0-.958.089-1.272.149-.211.043-.391.074-.54.074-.374 0-.523-.224-.583-.42-.061-.192-.09-.389-.135-.567-.046-.181-.105-.494-.166-.57-1.918-.222-2.95-.642-3.189-1.226a.6.6 0 01-.055-.225c-.015-.243.165-.465.42-.509 3.264-.54 4.73-3.879 4.791-4.02l.016-.029c.18-.345.224-.645.119-.869-.195-.434-.884-.658-1.332-.809a3.7 3.7 0 01-.346-.119c-.732-.283-1.227-.659-1.227-1.138 0-.06.003-.12.013-.18.046-.361.375-.69.838-.778a1.4 1.4 0 01.495-.06c.15 0 .299.015.449.059.375.164.735.271 1.048.286.181 0 .33-.046.405-.091l-.033-.539c-.104-1.628-.239-3.654.298-4.847C7.864 1.054 11.215.793 12.206.793z" />
  </svg>
);

const InstagramIcon = () => (
  <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227a3.81 3.81 0 01-.899 1.382 3.744 3.744 0 01-1.38.896c-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421a3.716 3.716 0 01-1.379-.899 3.644 3.644 0 01-.9-1.38c-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678a6.162 6.162 0 100 12.324 6.162 6.162 0 100-12.324zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405a1.441 1.441 0 11-2.88 0 1.441 1.441 0 012.88 0z" />
  </svg>
);

const RedditIcon = () => (
  <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.1 3.1 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913s2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73s-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z" />
  </svg>
);

const TikTokIcon = () => (
  <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
  </svg>
);

const PinterestIcon = () => (
  <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12.017 24c6.624 0 11.99-5.367 11.99-12C24.007 5.367 18.641 0 12.017 0z" />
  </svg>
);

const ThreadsIcon = () => (
  <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.472 12.01v-.017c.03-3.579.879-6.43 2.525-8.482C5.845 1.205 8.6.024 12.18 0h.014c2.746.02 5.043.725 6.826 2.098 1.677 1.29 2.858 3.13 3.509 5.467l-2.04.569c-1.104-3.96-3.898-5.984-8.304-6.015-2.91.022-5.11.936-6.54 2.717C4.307 6.504 3.616 8.914 3.589 12c.027 3.086.718 5.496 2.057 7.164 1.43 1.783 3.631 2.698 6.54 2.717 2.623-.02 4.358-.631 5.8-2.045 1.647-1.613 1.618-3.593 1.09-4.798-.31-.71-.873-1.3-1.634-1.75-.192 1.352-.622 2.446-1.284 3.272-.886 1.102-2.14 1.704-3.73 1.79-1.202.065-2.361-.218-3.259-.801-1.063-.689-1.685-1.74-1.752-2.96-.065-1.182.408-2.256 1.332-3.022.9-.746 2.13-1.201 3.556-1.315 1.09-.088 2.11.01 3.043.255-.05-.5-.152-.965-.306-1.388-.36-.986-1.028-1.714-1.988-2.166-.96-.452-2.156-.623-3.559-.507l-.133-2.014c1.72-.141 3.212.069 4.438.628 1.226.559 2.149 1.478 2.746 2.735.331.696.55 1.465.67 2.29.53.098 1.04.232 1.523.405 1.07.384 1.98.96 2.633 1.792.724.92 1.038 2.011 1.038 3.044 0 .323-.022.648-.068.977-.263 1.86-1.268 3.394-2.9 4.437-1.477.944-3.405 1.453-5.733 1.512-.045 0-.09.001-.135.001z" />
  </svg>
);

const DiscordIcon = () => (
  <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419-.0002 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1568 2.4189Z" />
  </svg>
);

// Create share platforms configuration
const createSharePlatforms = (data: ShareData): SharePlatform[] => {
  const encodedUrl = encodeURIComponent(data.url);
  const encodedTitle = encodeURIComponent(data.title);
  const encodedDesc = encodeURIComponent(data.description || '');

  return [
    {
      id: 'whatsapp',
      name: 'WhatsApp',
      nameAr: 'واتساب',
      icon: <WhatsAppIcon />,
      color: 'bg-green-500 hover:bg-green-600',
      action: () => {
        const text = encodeURIComponent(
          `${data.title}\n\n${data.description || ''}\n\n${data.url}`,
        );
        window.open(`https://wa.me/?text=${text}`, '_blank');
      },
    },
    {
      id: 'facebook',
      name: 'Facebook',
      nameAr: 'فيسبوك',
      icon: <FacebookIcon />,
      color: 'bg-blue-600 hover:bg-blue-700',
      action: () =>
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`, '_blank'),
    },
    {
      id: 'twitter',
      name: 'X',
      nameAr: 'إكس',
      icon: <XTwitterIcon />,
      color: 'bg-black hover:bg-gray-800',
      action: () =>
        window.open(
          `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
          '_blank',
        ),
    },
    {
      id: 'telegram',
      name: 'Telegram',
      nameAr: 'تيليجرام',
      icon: <TelegramIcon />,
      color: 'bg-sky-500 hover:bg-sky-600',
      action: () =>
        window.open(`https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`, '_blank'),
    },
    {
      id: 'linkedin',
      name: 'LinkedIn',
      nameAr: 'لينكد إن',
      icon: <LinkedInIcon />,
      color: 'bg-blue-700 hover:bg-blue-800',
      action: () =>
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`, '_blank'),
    },
    {
      id: 'messenger',
      name: 'Messenger',
      nameAr: 'ماسنجر',
      icon: <MessengerIcon />,
      color: 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600',
      action: () =>
        window.open(
          `https://www.facebook.com/dialog/send?link=${encodedUrl}&app_id=291494419107518&redirect_uri=${encodedUrl}`,
          '_blank',
        ),
    },
    {
      id: 'snapchat',
      name: 'Snapchat',
      nameAr: 'سناب شات',
      icon: <SnapchatIcon />,
      color: 'bg-yellow-400 hover:bg-yellow-500 text-black',
      action: () => window.open(`https://www.snapchat.com/share?url=${encodedUrl}`, '_blank'),
    },
    {
      id: 'instagram',
      name: 'Instagram',
      nameAr: 'إنستغرام',
      icon: <InstagramIcon />,
      color:
        'bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 hover:from-purple-600 hover:via-pink-600 hover:to-orange-600',
      action: () => {
        navigator.clipboard.writeText(`${data.title}\n${data.url}`);
        alert('تم نسخ الرابط! افتح انستغرام وشاركه');
      },
    },
    {
      id: 'tiktok',
      name: 'TikTok',
      nameAr: 'تيك توك',
      icon: <TikTokIcon />,
      color: 'bg-black hover:bg-gray-800',
      action: () => {
        navigator.clipboard.writeText(`${data.title}\n${data.url}`);
        alert('تم نسخ الرابط! افتح تيك توك وشاركه');
      },
    },
    {
      id: 'threads',
      name: 'Threads',
      nameAr: 'ثريدز',
      icon: <ThreadsIcon />,
      color: 'bg-black hover:bg-gray-800',
      action: () =>
        window.open(
          `https://www.threads.net/intent/post?text=${encodeURIComponent(`${data.title}\n${data.url}`)}`,
          '_blank',
        ),
    },
    {
      id: 'reddit',
      name: 'Reddit',
      nameAr: 'ريديت',
      icon: <RedditIcon />,
      color: 'bg-orange-500 hover:bg-orange-600',
      action: () =>
        window.open(
          `https://www.reddit.com/submit?url=${encodedUrl}&title=${encodedTitle}`,
          '_blank',
        ),
    },
    {
      id: 'pinterest',
      name: 'Pinterest',
      nameAr: 'بنترست',
      icon: <PinterestIcon />,
      color: 'bg-red-600 hover:bg-red-700',
      action: () => {
        const media = data.imageUrl ? `&media=${encodeURIComponent(data.imageUrl)}` : '';
        window.open(
          `https://pinterest.com/pin/create/button/?url=${encodedUrl}&description=${encodedDesc}${media}`,
          '_blank',
        );
      },
    },
    {
      id: 'discord',
      name: 'Discord',
      nameAr: 'ديسكورد',
      icon: <DiscordIcon />,
      color: 'bg-indigo-600 hover:bg-indigo-700',
      action: () => {
        navigator.clipboard.writeText(`${data.title}\n${data.description || ''}\n${data.url}`);
        alert('تم نسخ المحتوى للصق في Discord');
      },
    },
    {
      id: 'email',
      name: 'Email',
      nameAr: 'البريد',
      icon: <EnvelopeIcon className="h-6 w-6" />,
      color: 'bg-gray-600 hover:bg-gray-700',
      action: () => {
        const subject = encodeURIComponent(data.title);
        const body = encodeURIComponent(`${data.description || ''}\n\n${data.url}`);
        window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');
      },
    },
  ];
};

// Main Component
const UnifiedShareModal: React.FC<UnifiedShareModalProps> = ({
  isOpen,
  onClose,
  shareData,
  onShareSuccess,
  onCopySuccess,
  showQRCode = false,
  className = '',
}) => {
  const [copied, setCopied] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setCopied(false);
      setShowAll(false);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  const handleCopyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(shareData.url);
      setCopied(true);
      onCopySuccess?.();
      setTimeout(() => setCopied(false), 2500);
    } catch {
      const textArea = document.createElement('textarea');
      textArea.value = shareData.url;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  }, [shareData.url, onCopySuccess]);

  const handleNativeShare = useCallback(async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareData.title,
          text: shareData.description,
          url: shareData.url,
        });
        onShareSuccess?.('native');
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          console.error('فشل في المشاركة:', error);
        }
      }
    }
  }, [shareData, onShareSuccess]);

  const platforms = createSharePlatforms(shareData);
  const visiblePlatforms = showAll ? platforms : platforms.slice(0, 8);

  const handlePlatformClick = useCallback(
    (platform: SharePlatform) => {
      platform.action(shareData);
      onShareSuccess?.(platform.id);
    },
    [shareData, onShareSuccess],
  );

  if (!isOpen || !mounted) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-end justify-center sm:items-center"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className={`relative w-full max-w-md transform overflow-hidden rounded-t-2xl bg-white shadow-2xl sm:rounded-2xl ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 p-2.5 shadow-lg">
              <ShareIcon className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">مشاركة</h3>
              <p className="text-xs text-gray-500">اختر طريقة المشاركة</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
            aria-label="إغلاق"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Content Preview */}
        <div className="border-b border-gray-100 bg-gray-50 px-5 py-3">
          <div className="flex items-start gap-3">
            {shareData.imageUrl && (
              <img
                src={shareData.imageUrl}
                alt=""
                className="h-14 w-14 rounded-lg object-cover shadow-sm"
              />
            )}
            <div className="min-w-0 flex-1">
              <h4 className="truncate font-semibold text-gray-900">{shareData.title}</h4>
              {shareData.description && (
                <p className="mt-0.5 line-clamp-2 text-xs text-gray-500">{shareData.description}</p>
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-h-[50vh] overflow-y-auto p-5">
          {/* Native Share Button */}
          {typeof navigator !== 'undefined' && 'share' in navigator && (
            <button
              onClick={handleNativeShare}
              className="mb-4 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 px-4 py-3 font-medium text-white shadow-lg transition-all hover:shadow-xl active:scale-[0.98]"
            >
              <ShareIcon className="h-5 w-5" />
              <span>مشاركة سريعة</span>
            </button>
          )}

          {/* Platforms Grid */}
          <div className="mb-4">
            <h4 className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
              مشاركة عبر
            </h4>
            <div className="grid grid-cols-4 gap-3">
              {visiblePlatforms.map((platform) => (
                <button
                  key={platform.id}
                  onClick={() => handlePlatformClick(platform)}
                  className="group flex flex-col items-center gap-1.5 rounded-xl p-3 transition-all hover:bg-gray-50 active:scale-95"
                  title={platform.nameAr}
                >
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-full text-white shadow-md transition-transform group-hover:scale-110 ${platform.color}`}
                  >
                    {platform.icon}
                  </div>
                  <span className="text-[11px] font-medium text-gray-600">{platform.nameAr}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Show More/Less Button */}
          {platforms.length > 8 && (
            <button
              onClick={() => setShowAll(!showAll)}
              className="mb-4 flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-200 py-3 text-sm font-medium text-gray-500 transition-colors hover:border-gray-300 hover:bg-gray-50"
            >
              <span>{showAll ? 'عرض أقل' : `عرض المزيد (${platforms.length - 8})`}</span>
              <svg
                className={`h-4 w-4 transition-transform ${showAll ? 'rotate-180' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
          )}

          {/* Copy Link Section */}
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
            <h4 className="mb-2 text-xs font-semibold text-gray-700">أو انسخ الرابط</h4>
            <div className="flex gap-2">
              <input
                type="text"
                value={shareData.url}
                readOnly
                className="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700"
                dir="ltr"
              />
              <button
                onClick={handleCopyLink}
                className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                  copied
                    ? 'bg-green-100 text-green-700'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {copied ? (
                  <>
                    <CheckIcon className="h-4 w-4" />
                    <span>تم!</span>
                  </>
                ) : (
                  <>
                    <LinkIcon className="h-4 w-4" />
                    <span>نسخ</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* QR Code Section */}
          {showQRCode && (
            <div className="mt-4 flex flex-col items-center rounded-xl border border-gray-200 bg-white p-4">
              <QrCodeIcon className="h-8 w-8 text-gray-400" />
              <p className="mt-2 text-xs text-gray-500">امسح رمز QR للمشاركة</p>
              <a
                href={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(shareData.url)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 text-xs text-blue-600 hover:underline"
              >
                عرض رمز QR
              </a>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-100 bg-gray-50 px-5 py-3">
          <button
            onClick={onClose}
            className="w-full rounded-lg bg-gray-200 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-300"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};

export default UnifiedShareModal;
