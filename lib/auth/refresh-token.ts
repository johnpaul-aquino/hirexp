import { JWT } from 'next-auth/jwt'

export async function refreshAccessToken(token: JWT): Promise<JWT> {
  try {
    const url = 'https://oauth2.googleapis.com/token'
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        grant_type: 'refresh_token',
        refresh_token: token.refreshToken as string,
      }),
      method: 'POST',
    })

    const tokens = await response.json()

    if (!response.ok) {
      throw tokens
    }

    return {
      ...token,
      accessToken: tokens.access_token,
      expiresAt: Date.now() + tokens.expires_in * 1000,
      refreshToken: tokens.refresh_token ?? token.refreshToken,
    }
  } catch (error) {
    console.error('Error refreshing access token:', error)

    return {
      ...token,
      error: 'RefreshAccessTokenError',
    }
  }
}
