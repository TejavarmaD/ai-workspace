import { useEffect, useRef } from 'react'
import './ConstellationBackground.css'

export default function ConstellationBackground() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current

    if (!canvas) return

    const ctx = canvas.getContext('2d')

    if (!ctx) return

    let animationFrame = null

    let width = 0
    let height = 0
    let dpr = 1

    let stars = []
    let nodes = []

    const mouse = {
      x: null,
      y: null,
    }

    const reducedMotionQuery = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    )

    /*
     * =========================================================
     * RESPONSIVE DENSITY
     * =========================================================
     */

    const getStarCount = () => {
      const area = window.innerWidth * window.innerHeight

      if (window.innerWidth < 600) {
        return Math.min(180, Math.floor(area / 3000))
      }

      if (window.innerWidth < 1000) {
        return Math.min(300, Math.floor(area / 2800))
      }

      return Math.min(520, Math.floor(area / 2600))
    }

    const getNodeCount = () => {
      if (window.innerWidth < 600) {
        return 38
      }

      if (window.innerWidth < 1000) {
        return 65
      }

      return 95
    }

    /*
     * =========================================================
     * RESIZE
     * =========================================================
     */

    const resize = () => {
      width = window.innerWidth
      height = window.innerHeight

      dpr = Math.min(window.devicePixelRatio || 1, 2)

      canvas.width = width * dpr
      canvas.height = height * dpr

      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`

      ctx.setTransform(
        dpr,
        0,
        0,
        dpr,
        0,
        0
      )

      createScene()
    }

    /*
     * =========================================================
     * CREATE SCENE
     *
     * IMPORTANT:
     *
     * Nodes are now distributed across the ENTIRE viewport.
     * We no longer push them away from the center.
     * =========================================================
     */

    const createScene = () => {
      stars = []
      nodes = []

      /*
       * -------------------------------------------------------
       * BACKGROUND STARS
       * -------------------------------------------------------
       */

      const starCount = getStarCount()

      for (let i = 0; i < starCount; i++) {
        stars.push({
          x: Math.random() * width,
          y: Math.random() * height,

          radius:
            Math.random() < 0.88
              ? Math.random() * 0.75 + 0.2
              : Math.random() * 1.3 + 0.5,

          opacity:
            Math.random() * 0.45 + 0.08,

          phase:
            Math.random() * Math.PI * 2,

          twinkleSpeed:
            Math.random() * 0.0015 + 0.0005,
        })
      }

      /*
       * -------------------------------------------------------
       * CONSTELLATION NODES
       * -------------------------------------------------------
       *
       * The viewport is divided into a loose grid.
       * This prevents large empty areas while keeping
       * the constellation organic.
       */

      const nodeCount = getNodeCount()

      const columns =
        window.innerWidth < 600
          ? 5
          : window.innerWidth < 1000
            ? 7
            : 10

      const rows =
        window.innerWidth < 600
          ? 7
          : window.innerWidth < 1000
            ? 8
            : 10

      const cellWidth = width / columns
      const cellHeight = height / rows

      const totalCells = columns * rows

      const cells = []

      for (let i = 0; i < totalCells; i++) {
        cells.push(i)
      }

      /*
       * Shuffle cells.
       */

      for (let i = cells.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))

        ;[cells[i], cells[j]] = [cells[j], cells[i]]
      }

      /*
       * One or more nodes per region.
       */

      for (
        let i = 0;
        i < Math.min(nodeCount, cells.length);
        i++
      ) {
        const cell = cells[i]

        const column = cell % columns
        const row = Math.floor(cell / columns)

        /*
         * Random position inside the cell.
         *
         * This gives us even coverage without creating
         * a rigid grid.
         */

        const paddingX = cellWidth * 0.18
        const paddingY = cellHeight * 0.18

        const x =
          column * cellWidth +
          paddingX +
          Math.random() *
            Math.max(
              1,
              cellWidth - paddingX * 2
            )

        const y =
          row * cellHeight +
          paddingY +
          Math.random() *
            Math.max(
              1,
              cellHeight - paddingY * 2
            )

        /*
         * Larger nodes are intentionally less common.
         */

        const sizeRoll = Math.random()

        let radius

        if (sizeRoll > 0.92) {
          radius = Math.random() * 2.8 + 2.2
        } else if (sizeRoll > 0.72) {
          radius = Math.random() * 1.6 + 1.5
        } else {
          radius = Math.random() * 0.9 + 1
        }

        /*
         * Different restrained accent colors.
         */

        const colorRoll = Math.random()

        let color = 'blue'

        if (colorRoll > 0.82) {
          color = 'violet'
        } else if (colorRoll > 0.63) {
          color = 'cyan'
        }

        nodes.push({
          x,
          y,

          baseX: x,
          baseY: y,

          radius,

          opacity:
            Math.random() * 0.35 + 0.35,

          phase:
            Math.random() * Math.PI * 2,

          driftX:
            Math.random() * Math.PI * 2,

          driftY:
            Math.random() * Math.PI * 2,

          speed:
            Math.random() * 0.0005 + 0.00015,

          color,

          /*
           * Larger nodes glow more.
           */

          prominent: radius > 2,
        })
      }
    }

    /*
     * =========================================================
     * COLORS
     * =========================================================
     */

    const getColor = (node) => {
      if (node.color === 'violet') {
        return {
          r: 150,
          g: 105,
          b: 255,
        }
      }

      if (node.color === 'cyan') {
        return {
          r: 55,
          g: 205,
          b: 255,
        }
      }

      return {
        r: 75,
        g: 125,
        b: 255,
      }
    }

    /*
     * =========================================================
     * BACKGROUND
     * =========================================================
     */

    const drawBackground = () => {
      /*
       * Deep space base.
       */

      const background =
        ctx.createRadialGradient(
          width / 2,
          height / 2,
          0,
          width / 2,
          height / 2,
          Math.max(width, height) * 0.78
        )

      background.addColorStop(
        0,
        '#09112b'
      )

      background.addColorStop(
        0.38,
        '#050b20'
      )

      background.addColorStop(
        0.72,
        '#020616'
      )

      background.addColorStop(
        1,
        '#01030c'
      )

      ctx.fillStyle = background

      ctx.fillRect(
        0,
        0,
        width,
        height
      )

      /*
       * Very subtle blue atmospheric glow.
       */

      const atmosphere =
        ctx.createRadialGradient(
          width * 0.5,
          height * 0.5,
          0,
          width * 0.5,
          height * 0.5,
          Math.min(width, height) * 0.8
        )

      atmosphere.addColorStop(
        0,
        'rgba(50, 75, 190, 0.12)'
      )

      atmosphere.addColorStop(
        0.45,
        'rgba(35, 50, 140, 0.045)'
      )

      atmosphere.addColorStop(
        1,
        'rgba(0, 0, 0, 0)'
      )

      ctx.fillStyle = atmosphere

      ctx.fillRect(
        0,
        0,
        width,
        height
      )
    }

    /*
     * =========================================================
     * STARS
     * =========================================================
     */

    const drawStars = (time) => {
      stars.forEach((star) => {
        let opacity = star.opacity

        if (!reducedMotionQuery.matches) {
          opacity +=
            Math.sin(
              time * star.twinkleSpeed +
                star.phase
            ) * 0.12
        }

        ctx.beginPath()

        ctx.arc(
          star.x,
          star.y,
          star.radius,
          0,
          Math.PI * 2
        )

        ctx.fillStyle =
          `rgba(155, 185, 255, ${Math.max(
            0.025,
            opacity
          )})`

        ctx.fill()
      })
    }

    /*
     * =========================================================
     * UPDATE NODES
     * =========================================================
     */

    const updateNodes = (time) => {
      nodes.forEach((node) => {
        if (reducedMotionQuery.matches) {
          node.x = node.baseX
          node.y = node.baseY

          return
        }

        /*
         * Slow organic floating.
         */

        node.x =
          node.baseX +
          Math.sin(
            time * node.speed +
              node.driftX
          ) * 7

        node.y =
          node.baseY +
          Math.cos(
            time * node.speed +
              node.driftY
          ) * 7

        /*
         * Extremely subtle mouse interaction.
         */

        if (
          mouse.x !== null &&
          mouse.y !== null
        ) {
          const dx =
            mouse.x - node.x

          const dy =
            mouse.y - node.y

          const distance =
            Math.sqrt(
              dx * dx +
                dy * dy
            )

          const radius = 190

          if (
            distance > 0 &&
            distance < radius
          ) {
            const strength =
              (1 - distance / radius) *
              3

            node.x -=
              (dx / distance) *
              strength

            node.y -=
              (dy / distance) *
              strength
          }
        }
      })
    }

    /*
     * =========================================================
     * CONNECTIONS
     * =========================================================
     */

    const drawConnections = () => {
      /*
       * Distance scales with viewport.
       */

      const connectionDistance =
        window.innerWidth < 600
          ? 125
          : window.innerWidth < 1000
            ? 150
            : 175

      /*
       * Every node connects only to a few nearby nodes.
       *
       * This prevents the "spider web" effect.
       */

      for (
        let i = 0;
        i < nodes.length;
        i++
      ) {
        const current = nodes[i]

        const nearby = []

        for (
          let j = 0;
          j < nodes.length;
          j++
        ) {
          if (i === j) continue

          const other = nodes[j]

          const dx =
            current.x - other.x

          const dy =
            current.y - other.y

          const distance =
            Math.sqrt(
              dx * dx +
                dy * dy
            )

          if (
            distance <=
            connectionDistance
          ) {
            nearby.push({
              node: other,
              distance,
            })
          }
        }

        /*
         * Sort nearest first.
         */

        nearby.sort(
          (a, b) =>
            a.distance -
            b.distance
        )

        /*
         * Only connect to the closest
         * 2–3 nodes.
         */

        const maxConnections =
          current.prominent
            ? 3
            : 2

        nearby
          .slice(
            0,
            maxConnections
          )
          .forEach(
            ({ node, distance }) => {
              /*
               * Avoid drawing the same
               * connection twice.
               */

              const nodeIndex =
                nodes.indexOf(node)

              if (
                nodeIndex <= i
              ) {
                return
              }

              const alpha =
                (1 -
                  distance /
                    connectionDistance) *
                0.20

              const color =
                getColor(current)

              ctx.beginPath()

              ctx.moveTo(
                current.x,
                current.y
              )

              ctx.lineTo(
                node.x,
                node.y
              )

              ctx.strokeStyle =
                `rgba(
                  ${color.r},
                  ${color.g},
                  ${color.b},
                  ${alpha}
                )`

              ctx.lineWidth = 0.55

              ctx.stroke()
            }
          )
      }
    }

    /*
     * =========================================================
     * NODES
     * =========================================================
     */

    const drawNodes = (time) => {
      nodes.forEach((node) => {
        const color =
          getColor(node)

        let pulse = 1

        if (
          !reducedMotionQuery.matches
        ) {
          pulse =
            1 +
            Math.sin(
              time * 0.001 +
                node.phase
            ) *
              0.15
        }

        const radius =
          node.radius * pulse

        /*
         * Outer glow.
         */

        const glowRadius =
          node.prominent
            ? radius * 10
            : radius * 6

        const glow =
          ctx.createRadialGradient(
            node.x,
            node.y,
            0,
            node.x,
            node.y,
            glowRadius
          )

        glow.addColorStop(
          0,
          `rgba(
            ${color.r},
            ${color.g},
            ${color.b},
            ${node.prominent ? 0.34 : 0.20}
          )`
        )

        glow.addColorStop(
          1,
          `rgba(
            ${color.r},
            ${color.g},
            ${color.b},
            0
          )`
        )

        ctx.beginPath()

        ctx.arc(
          node.x,
          node.y,
          glowRadius,
          0,
          Math.PI * 2
        )

        ctx.fillStyle = glow

        ctx.fill()

        /*
         * Core node.
         */

        ctx.beginPath()

        ctx.arc(
          node.x,
          node.y,
          radius,
          0,
          Math.PI * 2
        )

        ctx.fillStyle =
          `rgba(
            ${color.r},
            ${color.g},
            ${color.b},
            ${node.opacity}
          )`

        ctx.fill()

        /*
         * Tiny bright center for
         * prominent nodes.
         */

        if (node.prominent) {
          ctx.beginPath()

          ctx.arc(
            node.x,
            node.y,
            radius * 0.35,
            0,
            Math.PI * 2
          )

          ctx.fillStyle =
            `rgba(
              225,
              235,
              255,
              0.75
            )`

          ctx.fill()
        }
      })
    }

    /*
     * =========================================================
     * RENDER
     * =========================================================
     */

    const render = (time) => {
      drawBackground()

      drawStars(time)

      updateNodes(time)

      drawConnections()

      drawNodes(time)

      if (
        !reducedMotionQuery.matches
      ) {
        animationFrame =
          requestAnimationFrame(
            render
          )
      }
    }

    /*
     * =========================================================
     * MOUSE
     * =========================================================
     */

    const handleMouseMove = (event) => {
      mouse.x = event.clientX
      mouse.y = event.clientY
    }

    const handleMouseLeave = () => {
      mouse.x = null
      mouse.y = null
    }

    /*
     * =========================================================
     * INITIALIZE
     * =========================================================
     */

    resize()

    window.addEventListener(
      'resize',
      resize
    )

    window.addEventListener(
      'mousemove',
      handleMouseMove
    )

    window.addEventListener(
      'mouseleave',
      handleMouseLeave
    )

    if (
      reducedMotionQuery.matches
    ) {
      render(0)
    } else {
      animationFrame =
        requestAnimationFrame(
          render
        )
    }

    /*
     * =========================================================
     * CLEANUP
     * =========================================================
     */

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(
          animationFrame
        )
      }

      window.removeEventListener(
        'resize',
        resize
      )

      window.removeEventListener(
        'mousemove',
        handleMouseMove
      )

      window.removeEventListener(
        'mouseleave',
        handleMouseLeave
      )
    }
  }, [])

  return (
    <div
      className="constellation-background"
      aria-hidden="true"
    >
      <canvas
        ref={canvasRef}
        className="constellation-canvas"
      />

      <div className="constellation-vignette" />
    </div>
  )
}