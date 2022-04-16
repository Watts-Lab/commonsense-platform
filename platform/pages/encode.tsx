import type { NextPage } from 'next'
import { SinglePageForm } from 'watts-forms'
import { getFetcher } from '../helpers/fetching'
import { encodeElements } from './questions'
import Base from '../components/base'
import useSWR from 'swr'
import { useSession } from 'next-auth/react'


const Encode: NextPage = () => {
  const { data, error } = useSWR({"url": "/api/statement"}, getFetcher)
  const statement: string = data ? data.text : ''
  const sessionProps = useSession()
  // might be undefined but base will just show loading screen
  const status = sessionProps.status
  const email = sessionProps?.data?.user?.email ? sessionProps.data.user.email : ''
  const sendData = "/api/encode"
  
  return ( 
    <Base status={status}>
      <div className='wrapper'>
        <div className="border_box sticky text-center">
          <h3> Please answer questions about this statement? </h3>
          <p>{statement}</p>
        </div>
        <SinglePageForm hiddenAttributes={[{"key": "email", "value": email}]} elements= {encodeElements} action={sendData}></SinglePageForm>
      </div>  
    </Base>
 )
}
export default Encode