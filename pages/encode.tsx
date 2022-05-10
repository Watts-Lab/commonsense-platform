import type { NextPage } from 'next'
import { SinglePageForm } from '@watts-lab/rapid-forms'
import { getFetcher } from '../helpers/fetching'
import { encodeElements } from '../components/questions'
import Base from '../components/base'
import useSWR from 'swr'
import { useSession } from 'next-auth/react'
import React, { FormEvent, FormEventHandler, useRef } from 'react'
import axios from 'axios'
import { useRouter } from "next/router";

interface EncodeProps { // required for mocking
  onSubmit?: FormEventHandler;
  onChange?: FormEventHandler;
}


const Encode: NextPage<EncodeProps> = ({onSubmit, onChange}) => {
  const { data, error } = useSWR({"url": "/api/statement"}, getFetcher)
  const statement: string = data ? data.text : ''
  const sessionProps = useSession()
  const router = useRouter()
  // might be undefined but base will just show loading screen
  const status = sessionProps.status
  const email = sessionProps?.data?.user?.email ? sessionProps.data.user.email : ''
  const form = useRef<Record<string, any>>({})  

  const handleSubmit: FormEventHandler = (event) => {
    event.preventDefault()
    axios.post('/api/encode', {...form.current, email, statement})
    router.push('/')
  }
 
  const handleChange= (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target as HTMLInputElement   
    if (event.currentTarget.checked !== undefined) {
      form.current[name] = event.currentTarget.checked ? value : null
    } else {
      form.current[name] = value
    }
  }

  return ( 
    <Base status={status}>
      <div className='wrapper'>
        <div className="border_box sticky text-center">
          <h3> Please answer questions about this statement? </h3>
          <p>{statement}</p>
        </div>
        <SinglePageForm elements= {encodeElements} onSubmit = {onSubmit ? onSubmit: handleSubmit} onChange={onChange ? onChange : handleChange}/>
      </div>  
    </Base>
 )
}
export default Encode