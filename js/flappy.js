function newElement(tagName, className) {
    const elem = document.createElement(tagName)
    elem.className = className
    return elem
}

function Barrier(reverse = false) {
    this.element = newElement('div', 'barrier')

    const edge = newElement('div', 'edge')
    const body = newElement('div', 'body')
    this.element.appendChild(reverse ? body : edge)
    this.element.appendChild(reverse ? edge : body)

    this.setHeight = height => body.style.height = `${height}px`
}

// const b = new Barrier(true)
// b.setHeight(300)
// document.querySelector('[wm-flappy]').appendChild(b.element)

function PairOfBarriers(height, opening, x) {
    this.element = newElement('div', 'pair-of-barriers')

    this.higher = new Barrier(true)
    this.lower = new Barrier(false)

    this.element.appendChild(this.higher.element)
    this.element.appendChild(this.lower.element)

    this.sortearOpening = () => {
        const heightHigher = Math.random() * (height - opening)
        const heightLower = height - opening - heightHigher
        this.higher.setHeight(heightHigher)
        this.lower.setHeight(heightLower)
    }

    this.getX = () => parseInt(this.element.style.left.split('px')[0])
    this.setX = x => this.element.style.left = `${x}px`
    this.getWidth = () => this.element.clientWidth

    this.sortearOpening()
    this.setX(x)
}

// const b = new PairOfBarriers(700, 200, 400)
// document.querySelector('[wm-flappy]').appendChild(b.element)

function Barriers(height, width, opening, space, notifyPoint) {
    this.pairs = [
        new PairOfBarriers(height, opening, width),
        new PairOfBarriers(height, opening, width + space),
        new PairOfBarriers(height, opening, width + space * 2),
        new PairOfBarriers(height, opening, width + space * 3),
    ]

    const displacement = 3
    this.animar = () => {
        this.pairs.forEach(pair => {
            pair.setX(pair.getX() - displacement)

            //quando o element sair da área do jogo
            if (pair.getX() < -pair.getWidth()) {
                pair.setX(pair.getX() + space * this.pairs.length)
                pair.sortearOpening()
            }

            const meio = width / 2
            const cruzouOMeio = pair.getX() + displacement >= meio
                && pair.getX() < meio
            if (cruzouOMeio) notifyPoint()
        })
    }
}

function Bird(heightMatch) {
    let flying = false

    this.element = newElement('img', 'bird')
    this.element.src = 'imgs/bird.png'

    this.getY = () => parseInt(this.element.style.bottom.split('px')[0])
    this.setY = y => this.element.style.bottom = `${y}px`

    window.onkeydown = e => flying = true
    window.onkeyup = e => flying = false

    this.animar = () => {
        const newY = this.getY() + (flying ? 8 : -5)
        const heightMaxima = heightMatch - this.element.clientHeight
        
        if (newY <= 0) {
            this.setY(0)
        } else if (newY >= heightMaxima) {
            this.setY(heightMaxima)
        } else {
            this.setY(newY)
        }
    }

    this.setY(heightMatch / 2)
}



function Progress() {
    this.element = newElement('span', 'progress')
    this.updatePoints = points => {
        this.element.innerHTML = points
    }
    this.updatePoints(0)
}

// const barriers = new Barriers(700, 1200, 200, 400)
// const bird = new bird(700)
// const areaDoJogo = document.querySelector('[wm-flappy]')
// areaDoJogo.appendChild(bird.element)
// areaDoJogo.appendChild(new Progress().element)
// barriers.pairs.forEach(pair => areaDoJogo.appendChild(pair.element))
// setInterval(() => {
//     barriers.animar()
//     bird.animar()
// }, 20)

function areOverlapping(elementA, elementB) {
    const a = elementA.getBoundingClientRect()
    const b = elementB.getBoundingClientRect()

    const horizontal = a.left + a.width >= b.left
        && b.left + b.width >= a.left
    const vertical = a.top + a.height >= b.top
        && b.top + b.height >= a.top
    return horizontal && vertical
}

function collided(bird, barriers) {
    let collided = false
    barriers.pairs.forEach(PairOfBarriers => {
        if (!collided) {
            const higher = PairOfBarriers.higher.element
            const lower = PairOfBarriers.lower.element
            collided = areOverlapping(bird.element, higher)
                || areOverlapping(bird.element, lower)
        }
    })
    return collided
}

function FlappyBird() {
    let points = 0

    const gameArea = document.querySelector('[wm-flappy]')
    const height = gameArea.clientHeight
    const width = gameArea.clientWidth

    const progress = new Progress()
    const barriers = new Barriers (height, width, 200, 400, 
        () => progress.updatePoints(++points))
    const bird = new Bird(height)

    gameArea.appendChild(progress.element)
    gameArea.appendChild(bird.element)
    barriers.pairs.forEach(pair => gameArea.appendChild(pair.element))

    this.start = () => {
        // loop of the game
        const timer = setInterval(() => {
            barriers.animar()
            bird.animar()

            if (collided(bird, barriers)) {
                clearInterval(timer)
            }
        }, 20)
    }
}

new FlappyBird().start()