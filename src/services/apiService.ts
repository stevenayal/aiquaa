// Servicio de API
// Este endpoint está conectado al backend desplegado en https://api.aiquaa.com
import { API_URL, apiRequest } from '../config/apiConfig';

// Ejemplo de función para obtener gastos (siguiendo el patrón solicitado)
export async function getGastos() {
  const res = await fetch(`${API_URL}/gastos`);
  if (!res.ok) throw new Error("Error al obtener gastos");
  return res.json();
}

// Ejemplo usando la función helper apiRequest
export async function getGastosWithHelper() {
  const response = await apiRequest('/gastos');
  return response.json();
}

// Funciones para el sistema de feedback
export async function getFeedback() {
  const response = await apiRequest('/feedback');
  return response.json();
}

export async function createFeedback(feedbackData: any) {
  const response = await apiRequest('/feedback', {
    method: 'POST',
    body: JSON.stringify(feedbackData),
  });
  return response.json();
}

export async function updateFeedback(id: string, feedbackData: any) {
  const response = await apiRequest(`/feedback/${id}`, {
    method: 'PUT',
    body: JSON.stringify(feedbackData),
  });
  return response.json();
}

export async function deleteFeedback(id: string) {
  const response = await apiRequest(`/feedback/${id}`, {
    method: 'DELETE',
  });
  return response.json();
}

// Funciones para artículos/blog
export async function getArticles() {
  const response = await apiRequest('/articles');
  return response.json();
}

export async function getArticle(id: string) {
  const response = await apiRequest(`/articles/${id}`);
  return response.json();
}

// Funciones para usuarios
export async function getUsers() {
  const response = await apiRequest('/users');
  return response.json();
}

export async function getUser(id: string) {
  const response = await apiRequest(`/users/${id}`);
  return response.json();
}
