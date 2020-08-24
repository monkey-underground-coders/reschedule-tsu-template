import React, { useCallback } from 'react'
import TextInput from 'react-autocomplete-input'
import 'react-autocomplete-input/dist/bundle.css'
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap'
import { DAY_OF_WEEK, WEEKSIGN, PAIRS, LEVELS, FACULTIES } from '../../utils/constants'
import { toast } from 'react-toastify'

const initialPairRange = (() => {
  const pairsRange = PAIRS[0].split('-')
  return { start: pairsRange[0], end: pairsRange[1] }
})()

const CreateItemModal = (props) => {
  const { isOpen, toggle } = props

  const [data, setData] = React.useState([
    // Full Subject Name
    {
      hasAutocomplete: true,
      label: 'Название предмета',
      name: 'fullSubjectName',
      value: '',
    },

    // Auditory address
    {
      hasAutocomplete: true,
      label: 'Адрес аудитории',
      name: 'auditoryAddress',
      value: '',
    },

    // Column position
    {
      label: 'Позиция пары',
      name: 'columnPosition',
      isArray: true,
      value: 0,
      values: [1, 2, 3, 4, 5, 6, 7],
    },

    // Subgroup count
    {
      label: 'Количество подгрупп',
      name: 'countOfSubgroups',
      value: 2,
      disabled: true,
    },

    // Cross pair
    {
      label: 'Кросс-пара (соединена ли с другими группами)',
      name: 'crossPair',
      value: 0,
      isArray: true,
      values: ['Нет', 'Да'],
    },

    // Day of week
    {
      label: 'День недели',
      isObject: true,
      name: 'dayOfWeek',
      value: Object.keys(DAY_OF_WEEK)[0],
      values: DAY_OF_WEEK,
    },

    // Start
    {
      label: 'Время начала',
      name: 'start',
      value: initialPairRange.start,
      isDate: true,
    },

    // End date
    {
      label: 'Время окончания',
      name: 'end',
      value: initialPairRange.end,
      isDate: true,
    },

    // Level
    {
      label: 'Уровень образования',
      name: 'level',
      isObject: true,
      value: Object.keys(LEVELS)[0],
      values: LEVELS,
    },

    // Faculty
    {
      label: 'Факультет',
      name: 'faculty',
      values: FACULTIES,
      value: Object.keys(FACULTIES)[0],
      isObject: true,
    },

    // Course level
    {
      label: 'Курс',
      name: 'course',
      value: 0,
      isArray: true,
      values: [1, 2, 3, 4, 5],
    },

    // Faculty group
    {
      hasAutocomplete: true,
      label: 'Группа',
      name: 'group',
      value: '',
    },

    // Subgroup
    {
      label: 'Подгруппа(-ы)',
      name: 'subgroup',
      isArray: true,
      value: 0,
      values: ['Обе подгруппы', 'Первая подгруппа', 'Вторая подгруппа'],
    },

    // Teacher name
    {
      hasAutocomplete: true,
      label: 'Имя преподавателя',
      name: 'teacherName',
      value: '',
    },

    // Teacher Title
    {
      hasAutocomplete: true,
      label: 'Титул преподавателя (доцент\\профессор\\и т.д)',
      name: 'teacherTitle',
      value: '',
    },

    // Week sign (plus/minus)
    {
      label: 'Тип недели (плюс\\минус\\неважно)',
      name: 'weekSign',
      isObject: true,
      value: Object.keys(WEEKSIGN)[0],
      values: WEEKSIGN,
    },

    {
      label: 'Игнорировать удаленную базу',
      name: 'ignoreExternalDb',
      isBoolean: true,
      value: false,
    },

    {
      label: 'Игнорировать последнюю запись из удаленной базы',
      name: 'ignoreLastExternalDbRecord',
      isBoolean: true,
      value: false,
    },
  ])

  const handleSubmit = (event) => {
    event.preventDefault()

    const normalizedPayload = data.reduce(
      (result, current) => ({
        ...result,
        [current.name]: current.value,
      }),
      {}
    )

    props
      .onCreate({
        ...normalizedPayload,
        shortSubjectName: normalizedPayload.fullSubjectName,
        crossPair: !!parseInt(normalizedPayload.crossPair),
        course: parseInt(normalizedPayload.course) + 1,
      })
      .then(() => {
        toast.success('Успешно добавлено!')
      })
  }

  const onInputChange = useCallback(
    (index, input, event) => {
      const nextData = [...data]

      const { value } = event.target

      if (input.name === 'columnPosition') {
        const pairRange = PAIRS[value].split('-')
        if (!pairRange.length) {
          throw new Error("There's no selected pair in PAIR_RANGE constant")
        }

        const [start, end] = pairRange
        const findStartIndex = data.findIndex((d) => d.name === 'start')

        if (findStartIndex === -1) {
          throw new Error("There's no such item: start")
        }

        const findEndIndex = data.findIndex((d) => d.name === 'end')
        if (findEndIndex === -1) {
          throw new Error("There's no such item: end")
        }

        nextData[findStartIndex] = { ...nextData[findStartIndex], value: start }
        nextData[findEndIndex] = { ...nextData[findEndIndex], value: end }
      }

      if (input.isBoolean) {
        nextData[index] = { ...nextData[index], value: !nextData[index].value }
      } else {
        nextData[index] = { ...nextData[index], value }
      }

      setData(nextData)
    },
    [data]
  )

  const renderedInputs = React.useMemo(
    () =>
      data.map((input, index) => {
        if (input.hasAutocomplete) {
          return (
            <div className="form-group col-md-6 col-12" key={index}>
              <label>{input.label}</label>

              <TextInput
                Component="input"
                className="form-control"
                value={input.value}
                name={input.name}
                onChange={(e) => onInputChange(index, input, { target: { value: e } })}
                options={props.autoCompleteOptions[input.name]}
                trigger=""
                offsetY={20}
                regex="^.*$"
                spacer=""
                requestOnlyIfNoOptions={false}
                required
              />
            </div>
          )
        }

        if (input.isDate) {
          return (
            <div className="form-group col-md-6 col-12" key={index}>
              <label>{input.label}</label>
              <input
                type="time"
                className="form-control"
                value={input.value}
                name={input.name}
                onChange={(e) => onInputChange(index, input, e)}
                required
              />
            </div>
          )
        }

        if (input.isBoolean) {
          return (
            <div className="form-group col-12 mb-1" key={index}>
              <input
                type="checkbox"
                value={input.value}
                name={input.name}
                onChange={(e) => onInputChange(index, input, e)}
                id={input.name}
                required
              />

              <label className="ml-2" htmlFor={input.name}>
                {input.label}
              </label>
            </div>
          )
        }

        if (input.hasOwnProperty('values')) {
          return (
            <div className="form-group col-md-6 col-12" key={index}>
              <label>{input.label}</label>
              <select
                value={input.value}
                name={input.name}
                className="form-control"
                onChange={(e) => onInputChange(index, input, e)}
                required
              >
                {input.isArray
                  ? input.values.map((val, idx) => (
                      <option value={idx} key={`${index}${idx}`}>
                        {val}
                      </option>
                    ))
                  : Object.keys(input.values).map((val, idx) => (
                      <option value={val} key={`${index}${idx}`}>
                        {input.values[val]}
                      </option>
                    ))}
              </select>
            </div>
          )
        }

        return (
          <div className="form-group col-md-6 col-12" key={index}>
            <label>{input.label}</label>
            <input
              type="text"
              className="form-control"
              value={input.value}
              name={input.name}
              onChange={(e) => onInputChange(index, input, e)}
              disabled={!!input.disabled}
              required
            />
          </div>
        )
      }),
    [data, onInputChange, props.autoCompleteOptions]
  )

  return (
    <div>
      <Modal size="lg" isOpen={isOpen} toggle={toggle} contentClassName="alert alert-primary">
        <ModalHeader toggle={toggle}>Создать новую пару</ModalHeader>
        <form onSubmit={handleSubmit}>
          <ModalBody>
            <div className="row">{renderedInputs}</div>
          </ModalBody>
          <ModalFooter>
            <Button color="secondary" type="button" onClick={toggle}>
              Отмена
            </Button>
            <Button color="primary" type="submit">
              Продолжить
            </Button>
          </ModalFooter>
        </form>
      </Modal>
    </div>
  )
}

export default CreateItemModal
