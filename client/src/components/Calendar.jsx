import { useMemo, useState } from 'react'

const SAMPLE_TRIPS = [
  {
    id: 't-paris',
    label: 'PARIS TRIP',
    start: new Date(2024, 0, 3),
    end: new Date(2024, 0, 7),
  },
  {
    id: 't-nyc',
    label: 'NYC GETAWAY',
    start: new Date(2024, 0, 14),
    end: new Date(2024, 0, 15),
  },
  {
    id: 't-japan',
    label: 'JAPAN ADVENTURE',
    start: new Date(2024, 0, 22),
    end: new Date(2024, 0, 26),
  },
]

function sameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

function inRange(day, start, end) {
  const d = new Date(day.getFullYear(), day.getMonth(), day.getDate())
  const s = new Date(start.getFullYear(), start.getMonth(), start.getDate())
  const e = new Date(end.getFullYear(), end.getMonth(), end.getDate())
  return d >= s && d <= e
}

export default function Calendar({ initialYear = new Date().getFullYear(), initialMonth = new Date().getMonth(), trips = SAMPLE_TRIPS }) {
  const [year, setYear] = useState(initialYear)
  const [month, setMonth] = useState(initialMonth) // 0 = January

  const { weeks, monthLabel } = useMemo(() => {
    const first = new Date(year, month, 1)
    const startDayIndex = first.getDay() // 0 (Sun) - 6 (Sat)
    const daysInMonth = new Date(year, month + 1, 0).getDate()

    const firstCellDate = new Date(year, month, 1 - startDayIndex)
    const totalCells = Math.ceil((startDayIndex + daysInMonth) / 7) * 7

    const days = Array.from({ length: totalCells }).map((_, i) => {
      const d = new Date(firstCellDate)
      d.setDate(firstCellDate.getDate() + i)
      return d
    })

    const weeks = []
    for (let i = 0; i < days.length; i += 7) {
      weeks.push(days.slice(i, i + 7))
    }

    const monthLabel = first.toLocaleString(undefined, { month: 'long', year: 'numeric' })

    return { weeks, monthLabel }
  }, [year, month])

  function prevMonth() {
    const m = month - 1
    if (m < 0) {
      setMonth(11)
      setYear((y) => y - 1)
    } else setMonth(m)
  }

  function nextMonth() {
    const m = month + 1
    if (m > 11) {
      setMonth(0)
      setYear((y) => y + 1)
    } else setMonth(m)
  }

  return (
    <div className="calendar card" aria-label="Calendar component">
      <div className="calendar-header">
        <button className="ghost-btn" onClick={prevMonth} aria-label="Previous month">◀</button>
        <div className="calendar-title">{monthLabel}</div>
        <button className="ghost-btn" onClick={nextMonth} aria-label="Next month">▶</button>
      </div>

      <div className="calendar-grid">
        <div className="weekday">SUN</div>
        <div className="weekday">MON</div>
        <div className="weekday">TUE</div>
        <div className="weekday">WED</div>
        <div className="weekday">THU</div>
        <div className="weekday">FRI</div>
        <div className="weekday">SAT</div>

        {weeks.map((week, wi) =>
          week.map((day, di) => {
            const isCurrentMonth = day.getMonth() === month
                // accept trips where start/end might be ISO strings
                const matching = trips
                  .map((t) => ({
                    ...t,
                    start: t.start instanceof Date ? t.start : new Date(t.start),
                    end: t.end instanceof Date ? t.end : new Date(t.end),
                  }))
                  .filter((t) => inRange(day, t.start, t.end))

            return (
              <div
                key={`${wi}-${di}`}
                className={`calendar-cell ${isCurrentMonth ? '' : 'outside'}`}
                aria-current={sameDay(day, new Date())}
              >
                <div className="date-number">{day.getDate()}</div>
                <div className="cell-trips">
                  {matching.map((t) => (
                    <div key={t.id} className="trip-badge">
                      {t.label}
                    </div>
                  ))}
                </div>
              </div>
            )
          }),
        )}
      </div>
    </div>
  )
}
