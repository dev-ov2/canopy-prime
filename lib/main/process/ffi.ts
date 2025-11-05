import koffi from 'koffi'

const kernel32 = koffi.load('kernel32.dll')

// Win32 types
const DWORD = 'uint32'
const HANDLE = 'void*'
const BOOL = 'int'

// Functions
const OpenProcess = kernel32.func('OpenProcess', HANDLE, [DWORD, 'bool', DWORD])
const QueryFullProcessImageNameW = kernel32.func('QueryFullProcessImageNameW', BOOL, [
  HANDLE,
  DWORD,
  'char16_t*',
  koffi.out(koffi.pointer(DWORD)),
])
const CloseHandle = kernel32.func('CloseHandle', BOOL, [HANDLE])

const PROCESS_QUERY_LIMITED_INFORMATION = 0x1000

export function getImagePathViaFFI(pid: number): string | null {
  // Open the process with limited query rights (works more often than MainModule)
  const hProcess = OpenProcess(PROCESS_QUERY_LIMITED_INFORMATION, false, pid)
  if (koffi.address(hProcess) === 0n) return null

  try {
    // Prepare a UTF-16 buffer & a DWORD length
    const CAP = 1024 // max chars
    const buf = Buffer.alloc(CAP * 2) // UTF-16LE, 2 bytes per char
    const sizePtr = Buffer.alloc(4) // DWORD out param
    sizePtr.writeUInt32LE(CAP, 0)

    const ok = QueryFullProcessImageNameW(hProcess, 0, buf, sizePtr)
    if (!ok) return null

    const chars = sizePtr.readUInt32LE(0)
    return buf.toString('ucs2', 0, chars * 2)
  } finally {
    CloseHandle(hProcess)
  }
}
