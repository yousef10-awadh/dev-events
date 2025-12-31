import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

function Navbar() {
  return (
    <header>
        <nav>
            <Link href="/" className='logo'>
            <Image src="/icons/logo.png" alt="logo" width={40} height={40}/>
            <p>EventEvent</p>
            </Link>
            <ul>
                <Link href="/">Home</Link>
                <Link href="/">Events</Link>
                <Link href="/">Create Event</Link>
            </ul>
        </nav>
    </header>
  )
}

export default Navbar