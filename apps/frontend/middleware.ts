import { withAuth } from "next-auth/middleware"

export default withAuth(
  function middleware(req) {
    // El middleware se ejecuta automáticamente para rutas protegidas
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token
    },
  }
)

export const config = { matcher: ["/dashboard/:path*", "/labs/:path*"] }
