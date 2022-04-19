import { NextPage } from "next"
import { useSession } from "next-auth/react"
import * as React from "react"

export interface BaseProps {
    children: any
    status?: string
}

const Base: React.FC<any> = ({ children, status }: BaseProps) => {
    if (status === "unauthenticated") {
        return <div> You are not logged in </div>
    }

    if (status === "loading") {
        return (<div> Loading...  </div>);
    }

    return (
      <div>
          {children}
      </div>
    )


}

export default Base