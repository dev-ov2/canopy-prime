export const IS_DEV = process.env.NODE_ENV === 'development'

const PROD_URL = 'https://canopy.ovv.gg'
const DEV_URL = 'http://localhost:3000'

export const PRIME_UID = '5097a339-3685-4a7e-8660-1ff874d4b0f6'

export const CORE_URL = IS_DEV ? DEV_URL : PROD_URL

export const isValidRequest = (event: any) => {
  const validProdRequest = event.origin === PROD_URL
  const matchesDevelopment = event.origin === 'http://localhost:3000'
  const validDevRequest = matchesDevelopment && IS_DEV

  return validProdRequest || validDevRequest
}
