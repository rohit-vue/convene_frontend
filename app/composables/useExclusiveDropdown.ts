type CloseHandler = () => void

export function useExclusiveDropdown() {
  const activeCloseHandler = useState<CloseHandler | null>('exclusive-dropdown-close', () => null)

  function openExclusive(close: CloseHandler) {
    const current = activeCloseHandler.value
    if (current && current !== close) {
      current()
    }
    activeCloseHandler.value = close
  }

  function closeExclusive(close: CloseHandler) {
    if (activeCloseHandler.value === close) {
      activeCloseHandler.value = null
    }
  }

  return { openExclusive, closeExclusive }
}
