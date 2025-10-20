import { collection, addDoc, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';

export interface UserInterest {
  id?: string;
  userId: string;
  postId: string;
  category: string;
  tags: string[];
  readingTime: number; // in seconds
  timeSpent: number; // percentage of total reading time
  timestamp: Date;
  engagement: 'low' | 'medium' | 'high';
}

export interface BlogPost {
  id: string;
  title: string;
  content: {
    excerpt: string;
    content: string;
    featuredImage: string;
    tags: string[];
    author: string;
    readTime: number;
    category: string;
  };
  status: 'published' | 'draft';
  lastModified: string;
  createdAt: string;
  views?: number;
  likes?: number;
  shares?: number;
  comments?: number;
}

export interface SuggestionScore {
  post: BlogPost;
  score: number;
  reasons: string[];
}

class BlogSuggestionEngine {
  private userId: string;
  private cache: Map<string, any> = new Map();
  private cacheTimeout: number = 5 * 60 * 1000; // 5 minutes

  constructor(userId: string = 'anonymous') {
    this.userId = userId;
  }

  // Cache management
  private getCacheKey(method: string, ...args: any[]): string {
    return `${method}_${this.userId}_${JSON.stringify(args)}`;
  }

  private getFromCache(key: string): any {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }
    this.cache.delete(key);
    return null;
  }

  private setCache(key: string, data: any): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  // Track user reading behavior
  async trackReading(postId: string, category: string, tags: string[], readingTime: number, totalReadingTime: number) {
    try {
      const timeSpent = (readingTime / totalReadingTime) * 100;
      const engagement = this.calculateEngagement(timeSpent, totalReadingTime);

      const interest: Omit<UserInterest, 'id'> = {
        userId: this.userId,
        postId,
        category,
        tags,
        readingTime,
        timeSpent,
        timestamp: new Date(),
        engagement
      };

      await addDoc(collection(db, 'userInterests'), interest);
    } catch (error) {
      console.error('Error tracking reading behavior:', error);
    }
  }

  // Calculate engagement level based on reading time
  private calculateEngagement(timeSpent: number, totalReadingTime: number): 'low' | 'medium' | 'high' {
    if (timeSpent >= 80 && totalReadingTime >= 30) return 'high';
    if (timeSpent >= 50 && totalReadingTime >= 15) return 'medium';
    return 'low';
  }

  // Get user's reading history
  async getUserInterests(limitCount: number = 50): Promise<UserInterest[]> {
    try {
      const q = query(
        collection(db, 'userInterests'),
        where('userId', '==', this.userId),
        orderBy('timestamp', 'desc'),
        limit(limitCount)
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as UserInterest));
    } catch (error) {
      console.error('Error fetching user interests:', error);
      return [];
    }
  }

  // Get all published blog posts with caching
  async getAllBlogPosts(): Promise<BlogPost[]> {
    const cacheKey = this.getCacheKey('getAllBlogPosts');
    const cached = this.getFromCache(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const q = query(
        collection(db, 'content'),
        where('type', '==', 'blog'),
        where('status', '==', 'published'),
        orderBy('lastModified', 'desc')
      );

      const snapshot = await getDocs(q);
      const posts = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as BlogPost));
      
      this.setCache(cacheKey, posts);
      return posts;
    } catch (error) {
      console.error('Error fetching blog posts:', error);
      return [];
    }
  }

  // Generate personalized suggestions with caching
  async generateSuggestions(currentPostId?: string, limitCount: number = 6): Promise<SuggestionScore[]> {
    const cacheKey = this.getCacheKey('generateSuggestions', currentPostId, limitCount);
    const cached = this.getFromCache(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const [userInterests, allPosts] = await Promise.all([
        this.getUserInterests(),
        this.getAllBlogPosts()
      ]);

      let suggestions: SuggestionScore[];

      if (userInterests.length === 0) {
        // If no reading history, return popular posts
        suggestions = this.getPopularPosts(allPosts, currentPostId, limitCount);
      } else {
        // Calculate user preferences
        const preferences = this.calculateUserPreferences(userInterests);
        
        // Score all posts
        suggestions = allPosts
          .filter(post => post.id !== currentPostId)
          .map(post => this.scorePost(post, preferences, userInterests, allPosts))
          .sort((a, b) => b.score - a.score)
          .slice(0, limitCount);
      }

      this.setCache(cacheKey, suggestions);
      return suggestions;
    } catch (error) {
      console.error('Error generating suggestions:', error);
      return [];
    }
  }

  // Calculate user preferences from reading history
  private calculateUserPreferences(interests: UserInterest[]) {
    const categoryWeights: Record<string, number> = {};
    const tagWeights: Record<string, number> = {};
    const engagementWeights: Record<string, number> = { 'low': 1, 'medium': 2, 'high': 3 };

    interests.forEach(interest => {
      // Weight by engagement level
      const weight = engagementWeights[interest.engagement] * (interest.timeSpent / 100);
      
      // Category preferences
      categoryWeights[interest.category] = (categoryWeights[interest.category] || 0) + weight;
      
      // Tag preferences
      interest.tags.forEach(tag => {
        tagWeights[tag] = (tagWeights[tag] || 0) + weight;
      });
    });

    return { categoryWeights, tagWeights };
  }

  // Score a post based on user preferences
  private scorePost(post: BlogPost, preferences: any, interests: UserInterest[], allPosts: BlogPost[]): SuggestionScore {
    let score = 0;
    const reasons: string[] = [];

    const category = post.content.category || 'general';
    const tags = post.content.tags || [];

    // Category matching (40% weight)
    const categoryScore = preferences.categoryWeights[category] || 0;
    if (categoryScore > 0) {
      score += categoryScore * 0.4;
      reasons.push(`Similar to your ${category} interests`);
    }

    // Tag matching (30% weight)
    const tagMatches = tags.filter(tag => preferences.tagWeights[tag] > 0);
    if (tagMatches.length > 0) {
      const tagScore = tagMatches.reduce((sum, tag) => sum + preferences.tagWeights[tag], 0) / tagMatches.length;
      score += tagScore * 0.3;
      reasons.push(`Matches your interest in: ${tagMatches.join(', ')}`);
    }

    // Recency bonus (15% weight)
    const daysSincePublished = (Date.now() - new Date(post.lastModified).getTime()) / (1000 * 60 * 60 * 24);
    if (daysSincePublished < 7) {
      score += 2;
      reasons.push('Recently published');
    } else if (daysSincePublished < 30) {
      score += 1;
      reasons.push('Published this month');
    }

    // Popularity bonus (10% weight)
    const popularityScore = ((post.views || 0) + (post.likes || 0) * 2 + (post.shares || 0) * 3) / 100;
    if (popularityScore > 0) {
      score += Math.min(popularityScore, 2);
      reasons.push('Popular among readers');
    }

    // Author preference (5% weight)
    const authorPosts = interests.filter(i => 
      allPosts.find(p => p.id === i.postId)?.content.author === post.content.author
    );
    if (authorPosts.length > 0) {
      score += 1;
      reasons.push(`From ${post.content.author}`);
    }

    return {
      post,
      score: Math.max(score, 0),
      reasons: reasons.slice(0, 3) // Limit to top 3 reasons
    };
  }

  // Get popular posts as fallback
  private getPopularPosts(allPosts: BlogPost[], currentPostId?: string, limitCount: number = 6): SuggestionScore[] {
    return allPosts
      .filter(post => post.id !== currentPostId)
      .map(post => ({
        post,
        score: ((post.views || 0) + (post.likes || 0) * 2 + (post.shares || 0) * 3),
        reasons: ['Popular content']
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, limitCount);
  }

  // Get related posts based on current post with caching
  async getRelatedPosts(currentPost: BlogPost, limitCount: number = 4): Promise<SuggestionScore[]> {
    const cacheKey = this.getCacheKey('getRelatedPosts', currentPost.id, limitCount);
    const cached = this.getFromCache(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const allPosts = await this.getAllBlogPosts();
      const currentCategory = currentPost.content.category || 'general';
      const currentTags = currentPost.content.tags || [];

      const relatedPosts = allPosts
        .filter(post => post.id !== currentPost.id)
        .map(post => {
          let score = 0;
          const reasons: string[] = [];

          // Same category (50% weight)
          if (post.content.category === currentCategory) {
            score += 5;
            reasons.push(`Same category: ${currentCategory}`);
          }

          // Tag overlap (40% weight)
          const commonTags = currentTags.filter(tag => 
            (post.content.tags || []).includes(tag)
          );
          if (commonTags.length > 0) {
            score += commonTags.length * 2;
            reasons.push(`Shared tags: ${commonTags.join(', ')}`);
          }

          // Same author (10% weight)
          if (post.content.author === currentPost.content.author) {
            score += 1;
            reasons.push(`Same author: ${currentPost.content.author}`);
          }

          return {
            post,
            score,
            reasons: reasons.slice(0, 2)
          };
        })
        .filter(item => item.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, limitCount);

      this.setCache(cacheKey, relatedPosts);
      return relatedPosts;
    } catch (error) {
      console.error('Error getting related posts:', error);
      return [];
    }
  }
}

export default BlogSuggestionEngine;
