import { db, auth } from '@/config/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { AnalyticsEventData } from './types';

class AnalyticsService {
  static async trackEvent(eventType: string, data: AnalyticsEventData = {}) {
    // Vérifier si l'utilisateur est connecté
    if (!auth.currentUser) {
      console.warn('No authenticated user for analytics tracking');
      return;
    }
    
    const now = new Date();
    
    try {
      await addDoc(collection(db, 'analytics_events'), {
        userId: auth.currentUser.uid,
        date: now.toISOString().split('T')[0], // Format: "2025-07-04"
        dayOfWeek: now.getDay(), // 0=Dimanche, 1=Lundi, etc.
        hour: now.getHours(), // 0-23
        eventType,
        timestamp: serverTimestamp(),
        ...data
      });
      
      console.log(`Analytics event tracked: ${eventType}`, data);
    } catch (error) {
      console.error('Error tracking analytics event:', error);
    }
  }

  // Méthodes helper pour les événements courants
  static async trackLogin() {
    await this.trackEvent('login');
  }

  static async trackLogout() {
    await this.trackEvent('logout');
  }

  static async trackPageView(pageName: string) {
    await this.trackEvent('page_view', { pageName });
  }

  static async trackCourseView(courseData: {
    subjectId: string;
    subjectName: string;
    courseId: string;
  }) {
    await this.trackEvent('course_view', courseData);
  }

  static async trackExerciseCompleted(exerciseData: {
    subjectId: string;
    subjectName: string;
    exerciseId: string;
    score?: number;
  }) {
    await this.trackEvent('exercise_completed', exerciseData);
  }
}

export default AnalyticsService;