import EventCard from '@/components/EventCard'
import ExploreBtn from '@/components/ExploreBtn'
import { events } from '@/lib/constants'
import React from 'react'



function page() {
  return (
    <section>

      <h1 className='text-center'>The Hub for Every Dev <br /> Event You Cant Miss </h1>
      <p className='text-center mt-5'>Hackathons,Meetups,and Conferences, All in One Place</p>
      <ExploreBtn/>
      <div className='mt-20 space-y-7'>
        <h1>Featured Events</h1>
        <ul className='events'>
          {events.map((event)=>(
            <li key={event.title}>
              <EventCard {...event}/>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

export default page