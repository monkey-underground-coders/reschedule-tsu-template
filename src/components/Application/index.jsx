import React, { useState, useCallback, useMemo, useEffect } from 'react'
import CreatePairModal from '../CreatePairModal'
import { baseUrl, generateHeaders } from '../../utils'
import { DAY_OF_WEEK, WEEKSIGN } from '../../utils/constants'
import { Pagination, PaginationItem, PaginationLink } from 'reactstrap'
import './index.css'

const App = (props) => {
  // Data loading flag
  const [loading, setLoading] = useState(false)

  // Page counter for pagination
  const [currentPage, setCurrentPage] = useState(0)

  // Pair data container
  const [data, setData] = useState({
    content: [],
    totalPages: 1,
    number: 0,
  })

  // Modal status flag
  const [createItemModal, setCreateItemModal] = useState(false)

  // Toggle modal function
  const toggleCreateItemModal = useCallback(() => setCreateItemModal(!createItemModal), [
    createItemModal,
    setCreateItemModal,
  ])

  const onCreate = useCallback(
    (payload) => {
      fetch(`${baseUrl}/cells/add`, {
        method: 'POST',
        headers: generateHeaders(props.token, true),
        body: JSON.stringify(payload),
      })
        .then((res) => {
          if (res.ok) {
            return res.json()
          }
          throw new Error('An error occured while sending POST request')
        })
        .then((json) => {
          setData({ ...data, content: [...data.content, json] })
        })
    },
    [data, props.token]
  )

  const onDelete = useCallback(
    (externalId) => () => {
      fetch(`${baseUrl}/cells/c/${externalId}`, { method: 'DELETE', headers: generateHeaders(props.token) }).then(
        (res) => {
          if (!res.ok) {
            throw new Error(`An error ocurred while deleting ${externalId}`)
          }

          setData({ ...data, content: data.content.filter((c) => c.externalId !== externalId) })
        }
      )
    },
    [data, props.token]
  )

  const logout = useCallback(() => {
    localStorage.clear()
    window.location.reload()
  }, [])

  useEffect(() => {
    setLoading(true)
    fetch(`${baseUrl}/cells/u/${props.username}/cells?size=150&page=${currentPage}`, {
      headers: generateHeaders(props.token, true),
    })
      .then((res) => {
        if (res.ok) {
          return res.json()
        }
        throw new Error('An error occured while sending GET request')
      })
      .then((json) => {
        setData({
          content: json.content,
          totalPages: json.totalPages,
        })
      })
      .finally(() => {
        setLoading(false)
      })
  }, [currentPage, props.token, props.username])

  const autoCompleteOptions = useMemo(() => {
    const reducedData = data.content.reduce(
      (acc, pair) => {
        acc.fullSubjectName.add(pair.fullSubjectName)
        acc.group.add(pair.group)
        acc.teacherName.add(pair.teacherName)
        acc.teacherTitle.add(pair.teacherTitle)
        acc.auditoryAddress.add(pair.auditoryAddress)
        return acc
      },
      {
        fullSubjectName: new Set(),
        group: new Set(),
        teacherName: new Set(),
        teacherTitle: new Set(),
        auditoryAddress: new Set(),
      }
    )
    return Object.keys(reducedData).reduce(
      (result, current) => ({ ...result, [current]: [...reducedData[current]] }),
      {}
    )
  }, [data.content])

  const renderedTableItems = useMemo(
    () =>
      data.content.map((item) => (
        <tr key={item.externalId}>
          <td>{DAY_OF_WEEK[item.dayOfWeek]}</td>
          <td>{item.columnPosition + 1}</td>
          <td>{WEEKSIGN[item.weekSign]}</td>
          <td>{item.group}</td>
          <td>{item.subgroup}</td>
          <td>{item.fullSubjectName}</td>
          <td>{item.crossPair ? 'Да' : 'Нет'}</td>
          <td>
            {item.teacherName} ({item.teacherTitle})
          </td>
          <td>{item.auditoryAddress}</td>
          <td>
            <i className="fas fa-times delete-icon text-danger" title="Удалить" onClick={onDelete(item.externalId)}></i>
          </td>
        </tr>
      )),
    [data, onDelete]
  )

  return (
    <div className="mx-5 my-5">
      <div className="container__body">
        {!loading ? (
          <>
            <div className="container__body__items mt-2">
              <h3 className="my-4 text-center">Таблица расписания ТвГУ</h3>
              <table className="table table-hoverable">
                <thead>
                  <tr>
                    <th>День недели</th>
                    <th>Позиция</th>
                    <th>Неделя(+\-)</th>
                    <th>Группа</th>
                    <th>Подгруппа</th>
                    <th>Предмет</th>
                    <th>Кросспара</th>
                    <th>Препод</th>
                    <th>Адрес</th>
                    <th style={{ width: 0 }}></th>
                  </tr>
                </thead>
                <tbody>{renderedTableItems}</tbody>
              </table>
            </div>

            <div className="container__body__actions">
              <div className="container__body__actions__inner">
                <button className="btn btn-primary" onClick={toggleCreateItemModal}>
                  Создать пару
                </button>

                <Pagination aria-label="Data pagination">
                  <PaginationItem>
                    <PaginationLink
                      previous
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={currentPage === 0 || loading}
                    />
                  </PaginationItem>
                  {[...new Array(data.totalPages).keys()].map((page) => (
                    <PaginationItem key={page} active={page === currentPage}>
                      <PaginationLink onClick={() => setCurrentPage(page)} disabled={page === currentPage || loading}>
                        {page + 1}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  <PaginationItem>
                    <PaginationLink
                      next
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={data.totalPages === currentPage + 1 || loading}
                    />
                  </PaginationItem>
                </Pagination>

                <button className="btn btn-danger" onClick={logout}>
                  Выход
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center">Загрузка...</div>
        )}
      </div>

      <CreatePairModal
        isOpen={createItemModal}
        toggle={toggleCreateItemModal}
        onCreate={onCreate}
        autoCompleteOptions={autoCompleteOptions}
      />
    </div>
  )
}

export default App
