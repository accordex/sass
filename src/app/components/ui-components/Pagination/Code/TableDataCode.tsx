import { Pagination } from 'flowbite-react'
import { useState } from 'react'

const TableDataCode = () => {
  const [tablePage, setTablePage] = useState(1)
  const onTableChange = (page: number) => setTablePage(page)

  return (
    <div>
      <div>
        <Pagination
          layout='table'
          currentPage={tablePage}
          totalItems={100}
          onPageChange={onTableChange}
          showIcons
          itemsPerPage={5}
        />
      </div>
    </div>
  )
}

export default TableDataCode
