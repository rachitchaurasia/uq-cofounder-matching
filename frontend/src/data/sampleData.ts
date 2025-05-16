import { NewsArticle } from '../navigation/types';

export const NEWS_CATEGORIES = ['All', 'Science', 'Health', 'Innovation', 'Startups', 'University'];

export const SAMPLE_NEWS_ARTICLES: NewsArticle[] = [
  {
    id: '1',
    title: 'Announcing the 2025 Chief Student Entrepreneur',
    author: 'Amal Jos Chacko',
    date: '5 hours ago',
    category: 'University',
    imageUrl: 'https://picsum.photos/seed/news1/600/400', // Replace with actual or placeholder URLs
    thumbnailUrl: 'https://picsum.photos/seed/thumb1/400/200',
    content: 'Detailed content about the 2025 Chief Student Entrepreneur... Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
    excerpt: 'The university is proud to announce Amal Jos Chacko as the Chief Student Entrepreneur for 2025, recognizing outstanding innovation and leadership.'
  },
  {
    id: '2',
    title: 'Central Banks in the US plan to cut interest rates',
    author: 'Mrigas',
    date: '1 day ago',
    category: 'Innovation',
    imageUrl: 'https://picsum.photos/seed/news2/600/400',
    thumbnailUrl: 'https://picsum.photos/seed/thumb2/400/200',
    content: 'Further details on the potential impacts of interest rate cuts by central banks... Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
    excerpt: 'Sources indicate that central banks are considering measures to stimulate economic growth through interest rate adjustments.'
  },
  {
    id: '3',
    title: 'Announcing the 2025 UQ Ventures Ambassadors',
    author: 'Yarra Kiseleva',
    date: '7 hours ago',
    category: 'Innovation',
    imageUrl: 'https://picsum.photos/seed/news3/600/400', // Use the actual image if available
    thumbnailUrl: 'https://picsum.photos/seed/thumb3/400/200', // Use the actual image from detail view
    content: "When Yarra arrived at UQ, she was set on a career in investment banking. But after participating in Ventures programs including Curiosity, Validate, and Hustle, she discovered her passion for solving problems and building solutions that make a real difference. Ventures helped her explore new ways to think about her future, and that journey led her to create Seatfinder, a startup already making waves in the travel industry. Ventures Manager Gav Parry said, We loved how Ventures played a small role in reshaping how Yarra not only saw her career, but the trajectory of her life. Getting to know Yarra over the last couple of months has been inspiring to see how curious she is. I'm incredibly excited for Yarra to share her journey as a student and founder over the coming 12 months Her startup, Seatfinder, co-founded with...",
    excerpt: 'Ventures are incredibly excited to welcome Yarra Kiseleva, founder of Seatfinder, as a The University of Queensland (UQ) 2025 Chief Student Entrepreneur!'
  },
  {
    id: '4',
    title: 'Hong Kong Techathon 2025 opens new international market to Blunge',
    author: 'UQ Ventures',
    date: '9 hours ago',
    category: 'Startups',
    imageUrl: 'https://picsum.photos/seed/news4/600/400',
    thumbnailUrl: 'https://picsum.photos/seed/thumb4/400/200',
    content: 'Detailed content about Blunge and the Hong Kong Techathon... Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.',
    excerpt: 'We are incredibly excited to introduce the new cohort of UQ Ventures Ambassadors—a group of passionate, students ready to represent and promote Ventures across the University.'
  },
  {
    id: '5',
    title: '2025 Ventures ilab Accelerator: Meet our cohort',
    author: 'UQ Ventures',
    date: '12 hours ago',
    category: 'Startups',
    imageUrl: 'https://picsum.photos/seed/news5/600/400',
    thumbnailUrl: 'https://picsum.photos/seed/thumb5/400/200',
    content: 'Meet the innovative startups selected for the 2025 Ventures ilab Accelerator program... Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
    excerpt: 'UQ Ventures nominated ilab Accelerator success story Blunge to attend the Hong Kong Techathon 2025.'
  },
  // Add more sample articles
];
