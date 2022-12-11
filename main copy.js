import './style copy.styl'
import Lenis from '@studio-freight/lenis'
import barba from '@barba/core'
import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'
import Flip from 'gsap/Flip'
import CustomEase from 'gsap/CustomEase'

gsap.registerPlugin(ScrollTrigger, Flip, CustomEase)

const select = (element) => document.querySelector(element)

let lenis

let sec
let container
let containerWrapper
let containerFg
let containerBg
let a = select('a')

let on = true
let request = null
let mouse = {
    x: 0,
    y: 0,
}
let tiltx = 0
let tilty = 0
let degree = 0

let cx = window.innerWidth / 2
let cy = window.innerHeight / 2

let contAni
let tlContainerRotation, tlScroll

window.addEventListener('mousemove', (e) => {
    if (on) {
        mouse.x = e.clientX
        mouse.y = e.clientY

        cancelAnimationFrame(request)
        request = requestAnimationFrame(contAni)
    }
})

CustomEase.create('backInOutExp', 'M0,0 C0.2,0 0.2,0.7 0.5,0.7 0.8,0.7 0.8,0 1,0')

init()
function raf(time) {
    lenis.raf(time)
    requestAnimationFrame(raf)
}
requestAnimationFrame(raf)

function animate3dTilt(element, placement) {
    const dx = placement === 'right' ? mouse.x / 1.5 - cx : mouse.x - cx / 1.5
    const dy = (mouse.y - cy) / 1.5
    tiltx = -dy / cy
    tilty = dx / cx
    const radius = Math.sqrt(Math.pow(tiltx, 2) + Math.pow(tilty, 2))
    degree = radius * 15

    gsap.to(element, {
        transform: `rotate3d(${tiltx}, ${tilty}, 0, ${degree}deg)`,
        duration: 2,
        ease: 'power2.out',
    })
}

barba.init({
    transitions: [
        {
            preventRunning: 'rules',
            enter(data) {
                data.next.container.classList.add('barba--fixed')
                tlContainerRotation.eventCallback('onComplete', () => {
                    data.next.container.classList.remove('barba--fixed')
                })
                return tlContainerRotation.play()
            },
            after() {
                init()
            },
        },
    ],
})

window.addEventListener('resize', () => {
    cx = window.innerWidth / 2
    cy = window.innerHeight / 2
})

function init() {
    on = true

    window.scrollTo(0, 0)

    lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        direction: 'vertical', // vertical, horizontal
        mouseMultiplier: 1.2,
    })

    sec = select('#sec')
    container = select('.container')
    containerWrapper = select('.container-wrapper')
    containerFg = container.querySelector('.container__fg')
    containerBg = container.querySelector('.container__bg')
    contAni = () => {
        const direction = sec.classList.contains('sec--right') ? 'right' : 'left'
        animate3dTilt(container, direction)
    }
    select('a').addEventListener('click', (e) => {
        on = !on
        lenis.destroy()
    })

    tlScroll = gsap.timeline({ paused: true, defaults: { ease: 'linear', duration: 3 } }).fromTo(containerFg, { y: 0 }, { y: -300 })
    ScrollTrigger.create({
        trigger: container,
        start: 'top center',
        end: 'bottom top',
        animation: tlScroll,
        scrub: 1,
    })

    tlContainerRotation = gsap
        .timeline({ paused: true, defaults: { ease: 'power3.inOut', duration: 1 } })
        .to(containerFg, { translateZ: '-5vw', ease: 'backInOutExp', duration: 1.5 })
        .to(containerBg, { translateZ: '-20vw', ease: 'backInOutExp', duration: 1.5 }, '<+=0.2')
        .add(() => {
            const state = Flip.getState(containerWrapper)
            containerWrapper.classList.toggle('fixed')
            Flip.from(state, { duration: 1, ease: 'power2.inOut' })
            gsap.to(container, { transform: 'rotate(0deg) rotateY(0deg) rotateX(0deg)', duration: 1.6 })
        }, '0.6')
        .add(() => {
            gsap.to('.barba--fixed', {
                '--clip1': '0vh',
                ease: 'power3.out',
                duration: 1.2,
                onStart: () => {
                    tlContainerRotation.pause()
                },
                onComplete: () => {
                    tlContainerRotation.progress(1)
                },
            })
        }, '1.6')
}
