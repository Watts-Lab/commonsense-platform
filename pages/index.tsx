import type { NextPage } from 'next'
import Link from 'next/link'

const Home: NextPage = () => {
  return (
    <main className="wrapper">
      <div>
        <h2> How common is common sense? </h2>
        <p>
          We are scientists trying to understand how common sense works. On this site, you can check how your common sense compares to other people around the world.
        </p>
        <h3> Take our 5 minute survey to find out</h3>
        <Link href = "/api/auth/signin">
          <a> Do you have common sense? </a>
        </Link>
        <br/>
        <p>
          Once your done, you can see the results. You can also choose to answer more question to get more detailed insights about your common sense or take part in other aspects of our research 
        </p>
        <footer className='footer'>
          <hr/>
          This project is led by the <a className='underline'> Computational Social Science Lab </a> at the University of Pennsylvania.
        </footer>
      </div>  
    </main>
  )
 
}
export default Home
