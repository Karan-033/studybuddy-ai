const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const getHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };
};

interface StudyMaterial {
  flashcards: Array<{ front: string; back: string }>;
  mcqs: Array<{
    question: string;
    options: string[];
    correct_answer: string;
    explanation: string;
  }>;
}

interface SaveStudySessionParams {
  userId?: string; // Optional now as backend validates token
  title: string;
  content: string;
  difficulty: string;
  materials: StudyMaterial;
}

export async function saveStudySession({
  title,
  content,
  difficulty,
  materials,
}: SaveStudySessionParams) {
  const response = await fetch(`${API_URL}/api/study`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({
      title,
      content,
      difficulty,
      materials,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to save session');
  }

  return response.json();
}

export async function fetchStudySessions(userId: string) {
  // userId arg kept for compatibility but token determines user
  const response = await fetch(`${API_URL}/api/study`, {
    headers: getHeaders(),
  });

  if (!response.ok) {
    throw new Error('Failed to fetch sessions');
  }

  return response.json();
}

export async function fetchStudySession(sessionId: string) {
  const response = await fetch(`${API_URL}/api/study/${sessionId}`, {
    headers: getHeaders(),
  });

  if (!response.ok) {
    throw new Error('Failed to fetch session');
  }

  return response.json();
}

export async function deleteStudySession(sessionId: string) {
  const response = await fetch(`${API_URL}/api/study/${sessionId}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });

  if (!response.ok) {
    throw new Error('Failed to delete session');
  }
}
