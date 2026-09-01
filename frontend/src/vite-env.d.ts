
/// <reference types="vite/client" />

declare module '*.jsx' {

  import { ComponentType } from 'react'

  const component: ComponentType<any>

  export default component

}

declare module '*/lib/auth' {

  export function AuthProvider(props: any): any

  export function useAuth(): any

}

declare module '*/lib/api' {

  const api: any

  export default api

}

