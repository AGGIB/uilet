const API_URL = process.env.NODE_ENV === 'production' 
  ? '/api' 
  : 'http://localhost:8080';

export const api = {
  async signIn(credentials) {
    const response = await fetch(`${API_URL}/auth/sign-in`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Ошибка авторизации');
    }
    
    return response.json();
  },

  async signUp(userData) {
    const response = await fetch(`${API_URL}/auth/sign-up`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Ошибка регистрации');
    }
    
    return response.json();
  },

  // Apartment-related functions
  async createApartment(formData) {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/api/apartments`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Ошибка при создании объявления');
    }

    return response.json();
  },

  async updateApartment(apartmentId, formData) {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/api/apartments/${apartmentId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Ошибка при обновлении объявления');
    }

    // Дожидаемся завершения обновления
    await response.json();

    // Получаем обновленные данные
    const updatedResponse = await fetch(`${API_URL}/api/apartments/${apartmentId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!updatedResponse.ok) {
      throw new Error('Ошибка при получении обновленных данных');
    }

    return updatedResponse.json();
  },

  async getApartments() {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/api/apartments`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Ошибка при получении объявлений');
    }

    return response.json();
  },

  async getApartment(apartmentId) {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/api/apartments/${apartmentId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Ошибка при получении объявления');
    }

    return response.json();
  },

  async deleteApartment(apartmentId) {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/api/apartments/${apartmentId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Ошибка при удалении объявления');
    }

    return response.json();
  },

  async deleteImage(apartmentId, imageIndex) {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/api/apartments/${apartmentId}/images/${imageIndex}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Ошибка при удалении изображения');
    }

    return response.json();
  },

  async toggleApartmentStatus(apartmentId) {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/api/apartments/${apartmentId}/toggle-active`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Ошибка при изменении статуса объявления');
    }

    return response.json();
  },

  getImageUrl(apartmentId, imageIndex) {
    return `${API_URL}/api/apartments/${apartmentId}/images/${imageIndex}`;
  },

  async getProfile() {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/api/user/profile`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to get profile');
    }
    
    return response.json();
  },
}; 