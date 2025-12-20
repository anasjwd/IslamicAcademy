import React from 'react'
import './Stats.css'

const Stats = () => {
  return (
    <section className='stat-items'>
        <div className='stat-item'>
            <div className='stat-icon'>👥</div>
            <div className='stat-number'>700+</div>
            <div className='stat-label'>طلاب نشطون</div>
        </div>
        <div className='stat-item'>
            <div className='stat-icon'>📖</div>
            <div className='stat-number'>12+</div>
            <div className='stat-label'>دورات متاحة</div>
        </div>
        <div className='stat-item'>
            <div className='stat-icon'>👨🏻‍🏫</div>
            <div className='stat-number'>6+</div>
            <div className='stat-label'>مدرسون خبراء</div>
        </div>
        <div className='stat-item'>
            <div className='stat-icon'>🎓</div>
            <div className='stat-number'>5+</div>
            <div className='stat-label'>سنوات من التميز</div>
        </div>
    </section>
  )
}

export default Stats
