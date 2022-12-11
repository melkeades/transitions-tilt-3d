import './style.styl'
import Lenis from '@studio-freight/lenis'
import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    direction: 'vertical', // vertical, horizontal
    mouseMultiplier: 1.2,
})

function raf(time) {
    lenis.raf(time)
    requestAnimationFrame(raf)
}

requestAnimationFrame(raf)

const select = (element) => document.querySelector(element)

function wrap(element) {
    // const element = Array.prototype.shift(arguments)
    const wrappingElement = document.querySelector(element)
    let wrapperTag = 'div',
        wrapperAttributes = { data: {} }

    const parsString = (string) => {
        const symbol = string.charAt(0)
        const value = string.slice(1)

        if (symbol === '#') {
            wrapperAttributes.id = value
        } else if (symbol === '.') {
            wrapperAttributes.class = value
        } else if (symbol === '<') {
            wrapperTag = value
        }
    }

    for (let i = 1; i <= arguments.length; i++) {
        if (
            typeof arguments[i] === 'string' ||
            arguments[i] instanceof String
        ) {
            parsString(arguments[i])
        } else if (
            typeof arguments[i] === 'object' &&
            !Array.isArray(arguments[i]) &&
            arguments[i] !== null
        ) {
            for (const newProperty in arguments[i]) {
                wrapperAttributes.data['data-' + newProperty] =
                    arguments[i][newProperty]
            }
        }
    }

    const wrapperContainer = document.createElement(wrapperTag)

    if (wrapperAttributes.id) {
        wrapperContainer.setAttribute('id', wrapperAttributes.id)
    }
    if (wrapperAttributes.class) {
        wrapperContainer.setAttribute('class', wrapperAttributes.class)
    }
    for (const attribute in wrapperAttributes.data) {
        wrapperContainer.setAttribute(
            attribute,
            wrapperAttributes.data[attribute]
        )
    }
    wrappingElement.replaceWith(wrapperContainer)
    wrapperContainer.appendChild(wrappingElement)
}

gsap.set('.sec1', { perspective: 1000 })
gsap.set('.sec1', { transformOrigin: 'center top' })

const tlSec1Scroll = gsap.timeline({ defaults: { ease: 'none' } })
const tlSec2Scroll = gsap.timeline({ defaults: { ease: 'none' } })

tlSec1Scroll.to('.sec1', { opacity: 0.5, rotationX: -80 })
tlSec2Scroll.to('.sec2__info', { opacity: 1 })

ScrollTrigger.create({
    // markers: true,
    trigger: '.sec1',
    start: 'top 20%',
    // end: 'bottom 20%',
    animation: tlSec1Scroll,
    scrub: 1,
    pin: true,
    pinSpacing: false,
})

ScrollTrigger.create({
    // markers: true,
    trigger: '.sec2',
    start: 'top 20%',
    // end: 'bottom 20%',
    animation: tlSec2Scroll,
    scrub: 1,
    pin: true,
    pinSpacing: false,
})
