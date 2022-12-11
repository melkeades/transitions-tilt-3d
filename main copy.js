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

let secs
const containerClass = '.container'
const containerWrapperClass = containerClass + '-wrapper'
const containerFgClass = containerClass + '__fg'
const containerBgClass = containerClass + '__bg'

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

let tlContainerRotation, tlScroll
let tlWorkOutroSec, tlWorkOutroSecCenter, tlWorkClicked

CustomEase.create('backInOutExp', 'M0,0 C0.2,0 0.2,0.7 0.5,0.7 0.8,0.7 0.8,0 1,0')

init()
function raf(time) {
    lenis.raf(time)
    requestAnimationFrame(raf)
}
requestAnimationFrame(raf)

window.addEventListener('mousemove', (e) => {
    if (on) {
        mouse.x = e.clientX
        mouse.y = e.clientY

        cancelAnimationFrame(request)
        request = requestAnimationFrame(updateAnimate3dTile)
    }
})

const updateAnimate3dTile = () => {
    secs.forEach((element) => {
        const secCont = element.querySelector(containerClass)
        const elementClasses = element.classList
        let direction

        if (elementClasses.contains('sec--right')) {
            direction = 'right'
        } else if (elementClasses.contains('sec--left')) {
            direction = 'left'
        } else {
            direction = 'center'
        }

        if (elementInViewport(secCont)) {
            animate3dTilt(secCont, direction)
        }
    })
}

function animate3dTilt(element, direction) {
    let dx
    if (direction === 'right') {
        dx = mouse.x / 1.5 - cx
    } else if (direction === 'left') {
        dx = mouse.x - cx / 1.5
    } else {
        dx = mouse.x - cx
    }
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

    secs = document.querySelectorAll('.sec')

    secs.forEach((element) => {
        const secCont = element.querySelector(containerClass)
        const secContFg = element.querySelector(containerFgClass)
        ScrollTrigger.create({
            trigger: secCont,
            start: 'top center',
            end: 'bottom top',
            animation: gsap.fromTo(secContFg, { y: 0 }, { y: '-10%', ease: 'linear' }),
            scrub: 1,
        })
    })

    const tlWorkOutro = (element) => {
        const section = document.querySelector(element)

        const containerWrapper = section.querySelector(containerWrapperClass)
        const container = section.querySelector(containerClass)
        const containerFg = section.querySelector(containerFgClass)
        const containerBg = section.querySelector(containerBgClass)
        const tl = gsap
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
                        tl.pause()
                    },
                    onComplete: () => {
                        tl.progress(1)
                    },
                })
            }, '1.6')
        return tl
    }

    const hrefs = document.querySelectorAll('a')

    const gg = (path, tag) => path.find((e) => e.localName === tag)

    hrefs.forEach((element) => {
        element.addEventListener('click', (e) => {
            const secId = gg(e.path, 'section').id

            tlWorkClicked = tlWorkOutro('#' + secId)
            on = !on
            lenis.destroy()
        })
    })
}

barba.init({
    transitions: [
        {
            preventRunning: 'rules',
            enter(data) {
                data.next.container.classList.add('barba--fixed')
                tlWorkClicked.eventCallback('onComplete', () => {
                    data.next.container.classList.remove('barba--fixed')
                })
                return tlWorkClicked.play()
            },
            after() {
                init()
            },
        },
    ],
})

function elementInViewport(elementToCheck) {
    const element = elementToCheck
    const bounding = element.getBoundingClientRect()
    const elementHeight = element.offsetHeight
    const elementWidth = element.offsetWidth

    if (
        bounding.top >= -elementHeight &&
        bounding.left >= -elementWidth &&
        bounding.right <= (window.innerWidth || document.documentElement.clientWidth) + elementWidth &&
        bounding.bottom <= (window.innerHeight || document.documentElement.clientHeight) + elementHeight
    ) {
        return true
    } else {
        return false
    }
}
