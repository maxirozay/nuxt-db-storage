export default defineOAuthMicrosoftEventHandler({
  async onSuccess(event, { user, tokens }) {
    await setUserSession(event, {
      user: {
        microsoftId: user.id,
        email: user.email,
        name: user.name
      }
    })
    return sendRedirect(event, '/')
  },
  onError(event, error) {
    console.error('Microsoft OAuth error:', error)
    return sendRedirect(event, '/signin')
  }
})
