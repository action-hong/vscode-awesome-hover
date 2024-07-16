import dayjs from 'dayjs'

export function formatTime(timeStamp: string, format: string) {
  const stamp = timeStamp.toString().padEnd(13, '0')
  const time = Number.parseInt(stamp)
  return dayjs(time).format(format)
}
