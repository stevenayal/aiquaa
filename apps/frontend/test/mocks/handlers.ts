import { http, HttpResponse } from 'msw';

const baseUrl = 'http://localhost:3000/api/v1';

export const handlers = [
  // Health endpoint
  http.get(`${baseUrl}/health`, () => {
    return HttpResponse.json({
      status: 'ok',
      time: new Date().toISOString(),
      version: '1.0.0',
    });
  }),

  // Auth endpoints - Register
  http.post(`${baseUrl}/auth/register`, async ({ request }) => {
    const body = await request.json() as any;

    // Validar datos requeridos
    if (!body || !body.email || !body.password || !body.name) {
      return HttpResponse.json(
        { message: 'Todos los campos son requeridos' },
        { status: 400 }
      );
    }

    // Simular email ya registrado
    if (body.email === 'existing@example.com') {
      return HttpResponse.json(
        { message: 'El email ya está registrado' },
        { status: 409 }
      );
    }

    // Validar contraseña
    if (body.password.length < 8) {
      return HttpResponse.json(
        { message: 'La contraseña debe tener al menos 8 caracteres' },
        { status: 400 }
      );
    }

    // Validar complejidad de contraseña
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(body.password)) {
      return HttpResponse.json(
        { message: 'La contraseña debe contener al menos una mayúscula, una minúscula y un número' },
        { status: 400 }
      );
    }

    // Validar confirmación de contraseña
    if (body.password !== body.confirmPassword) {
      return HttpResponse.json(
        { message: 'Las contraseñas no coinciden' },
        { status: 400 }
      );
    }

    // Registro exitoso
    return HttpResponse.json(
      {
        message: 'Usuario registrado exitosamente',
        user: {
          id: Date.now(),
          email: body.email,
          name: body.name,
        },
      },
      { status: 201 }
    );
  }),

  // Auth endpoints - Login
  http.post(`${baseUrl}/auth/login`, async ({ request }) => {
    const body = await request.json() as any;

    if (body && body.email === 'test@example.com' && body.password === 'password123') {
      return HttpResponse.json({
        access_token: 'mock-access-token',
        refresh_token: 'mock-refresh-token',
        user: {
          id: 1,
          email: body.email,
          name: 'Test User',
        },
      });
    }

    return new HttpResponse(null, { status: 401 });
  }),

  http.post(`${baseUrl}/auth/refresh`, async ({ request }) => {
    const body = await request.json() as any;

    if (body && body.refresh_token === 'mock-refresh-token') {
      return HttpResponse.json({
        access_token: 'new-mock-access-token',
        refresh_token: 'new-mock-refresh-token',
      });
    }

    return new HttpResponse(null, { status: 401 });
  }),

  // Forum endpoints
  http.get(`${baseUrl}/forum/categories`, () => {
    return HttpResponse.json([
      {
        id: 1,
        name: 'General',
        description: 'General discussion',
        slug: 'general',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 2,
        name: 'Technical',
        description: 'Technical discussions',
        slug: 'technical',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ]);
  }),

  http.get(`${baseUrl}/forum/threads`, () => {
    return HttpResponse.json([
      {
        id: 1,
        title: 'Test Thread 1',
        content: 'Test content 1',
        slug: 'test-thread-1',
        authorId: 1,
        categoryId: 1,
        isSticky: false,
        isLocked: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        author: {
          id: 1,
          name: 'Test User',
          email: 'test@example.com',
        },
        category: {
          id: 1,
          name: 'General',
          slug: 'general',
        },
        _count: {
          posts: 5,
        },
      },
      {
        id: 2,
        title: 'Test Thread 2',
        content: 'Test content 2',
        slug: 'test-thread-2',
        authorId: 1,
        categoryId: 1,
        isSticky: false,
        isLocked: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        author: {
          id: 1,
          name: 'Test User',
          email: 'test@example.com',
        },
        category: {
          id: 1,
          name: 'General',
          slug: 'general',
        },
        _count: {
          posts: 3,
        },
      },
    ]);
  }),

  http.post(`${baseUrl}/forum/threads`, async ({ request }) => {
    const body = await request.json() as any;
    
    return HttpResponse.json({
      id: 3,
      title: body.title,
      content: body.content,
      slug: `thread-${Date.now()}`,
      authorId: 1,
      categoryId: body.categoryId,
      isSticky: false,
      isLocked: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }, { status: 201 });
  }),

  http.get(`${baseUrl}/forum/threads/:id`, ({ params }) => {
    const { id } = params;
    
    return HttpResponse.json({
      id: parseInt(id as string),
      title: `Thread ${id}`,
      content: `Content for thread ${id}`,
      slug: `thread-${id}`,
      authorId: 1,
      categoryId: 1,
      isSticky: false,
      isLocked: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      author: {
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
      },
      category: {
        id: 1,
        name: 'General',
        slug: 'general',
      },
      posts: [
        {
          id: 1,
          content: 'First post content',
          authorId: 1,
          threadId: parseInt(id as string),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          author: {
            id: 1,
            name: 'Test User',
            email: 'test@example.com',
          },
        },
      ],
    });
  }),

  http.post(`${baseUrl}/forum/threads/:id/posts`, async ({ request, params }) => {
    const body = await request.json() as any;
    const { id } = params;
    
    return HttpResponse.json({
      id: Date.now(),
      content: body.content,
      authorId: 1,
      threadId: parseInt(id as string),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }, { status: 201 });
  }),
];
