import messages from '../messages.json'

export function t(key) {
  return messages.fr[key] || key
}
