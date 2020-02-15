import React from 'react'
import CreatePairModal from '../CreatePairModal'
import { baseUrl, generateHeaders } from '../../utils'
import { DAY_OF_WEEK, WEEKSIGN } from '../../utils/constants'
import { Pagination, PaginationItem, PaginationLink } from 'reactstrap'
import './index.css'

const App = props => {
  // Data loading flag
  const [loading, setLoading] = React.useState(false)

  // Page counter for pagination
  const [currentPage, setCurrentPage] = React.useState(0)

  // Pair data container
  const [data, setData] = React.useState({
    content: [],
    totalPages: 1,
    number: 0
  })

  // Modal status flag
  const [createItemModal, setCreateItemModal] = React.useState(false)

  // Toggle modal function
  const toggleCreateItemModal = () => setCreateItemModal(!createItemModal)

  const onCreate = payload => {
    fetch(`${baseUrl}/cells/add`, {
      method: 'POST',
      headers: generateHeaders(props.token, true),
      body: JSON.stringify(payload)
    })
      .then(res => {
        if (res.ok) {
          return res.json()
        }
        throw new Error('An error occured while sending POST request')
      })
      .then(json => {
        setData({ ...data, content: [...data.content, json] })
      })
  }

  const onDelete = externalId => () => {
    alert(externalId)
  }

  const logout = () => {
    localStorage.clear()
    window.location.reload()
  }

  React.useEffect(() => {
    setLoading(true)
    fetch(`${baseUrl}/cells/u/${props.username}/cells?size=150&page=${currentPage}`, {
      headers: generateHeaders(props.token, true)
    })
      .then(res => {
        setLoading(false)
        if (res.ok) {
          return res.json()
        }
        throw new Error('An error occured while sending GET request')
      })
      .then(json => {
        setData({
          content: json.content,
          totalPages: json.totalPages
        })
      })
  }, [currentPage])

  const autoCompleteOptions = React.useMemo(() => {
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
        auditoryAddress: new Set()
      }
    )
    return Object.keys(reducedData).reduce((data, key) => ({ ...data, [key]: [...reducedData[key]] }), {})
  }, [data.content])

  const renderedTableItems = React.useMemo(
    () =>
      data.content.map(item => (
        <tr key={item.externalId}>
          <td>{DAY_OF_WEEK[item.dayOfWeek]}</td>
          <td>{item.columnPosition}</td>
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
    [data]
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
                  {[...new Array(data.totalPages).keys()].map(page => (
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
