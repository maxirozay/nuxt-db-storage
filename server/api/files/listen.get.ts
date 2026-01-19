import { fileHub } from '../../utils/hub'

export default defineEventHandler(async (event) => {
  await requireUserSession(event)
  
  setHeader(event, 'Content-Type', 'text/event-stream')
  setHeader(event, 'Cache-Control', 'no-cache')
  setHeader(event, 'Connection', 'keep-alive')
  setResponseStatus(event, 200)

  const sendEvent = (data: any) => {
    event.node.res.write(`data: ${JSON.stringify(data)}\n\n`)
  }

  const listener = () => {
    sendEvent({ type: 'change' })
  }

  fileHub.on('change', listener)

  // Send initial connection message to confirm it's working
  sendEvent({ type: 'connected' })

  // Clean up listener when connection closes
  event.node.req.on('close', () => {
    fileHub.off('change', listener)
    event.node.res.end()
  })

  // Keep the connection open
  return new Promise(() => {
    // Never resolve, handled by req close
  })
})
