import React from "react";
import { useTable, useSortBy, usePagination } from "react-table";
import "./DataTable.css"; // Ensure this file is imported

const DataTable = ({
  users = [],
  onEdit,
  onDelete,
  onActivate,
  onDeactivate,
}) => {
  const columns = React.useMemo(
    () => [
      {
        Header: "No.",
        Cell: ({ row }) => row.index + 1,
      },
      {
        Header: "ID",
        accessor: "user_id",
      },
      {
        Header: "Name",
        accessor: "firstname",
        Cell: ({ row }) =>
          `${row.original.firstname} ${row.original.middlename} ${row.original.lastname}`,
      },
      {
        Header: "Email",
        accessor: "email",
      },
      {
        Header: "Contact No.",
        accessor: "contact",
      },
      {
        Header: "Address",
        accessor: "address",
      },
      {
        Header: "Role",
        accessor: "role",
      },
      {
        Header: "Status",
        accessor: "status",
        Cell: ({ value }) =>
          value === "Active" ? (
            <i
              className="bi bi-check-circle-fill"
              style={{ color: "green" }}
            ></i>
          ) : (
            <i className="bi bi-x-circle-fill" style={{ color: "red" }}></i>
          ),
      },
      {
        Header: "",
        accessor: "actions",
        disableSortBy: true, // Disable sorting for actions column
        Cell: ({ row }) => (
          <div className="dropdown text-center">
            <p
              className="fs-5 bi bi-three-dots-vertical"
              type="button"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            ></p>
            <ul className="dropdown-menu ps-3">
              {row.original.status === "Deactivated" ? (
                <button
                  data-bs-toggle="modal"
                  data-bs-target="#statusBackDrop"
                  onClick={() => {
                    onActivate(row.original);
                  }}
                  className="btn btn-success mb-2"
                >
                  Activate
                </button>
              ) : (
                <button
                  data-bs-toggle="modal"
                  data-bs-target="#statusBackDrop"
                  onClick={() => {
                    onDeactivate(row.original);
                  }}
                  className="btn btn-orange mb-2"
                >
                  Deactivate
                </button>
              )}

              <button
                className="btn btn-danger mb-2"
                data-bs-toggle="modal"
                data-bs-target="#deleteBackdrop"
                onClick={() => onDelete(row.original)}
              >
                <i className="bi bi-trash me-2"></i>
                Delete
              </button>

              <button
                className="btn btn-warning"
                data-bs-toggle="modal"
                data-bs-target="#editBackDrop"
                onClick={() => onEdit(row.original)}
              >
                <i className="bi bi-pencil-square me-2"></i>
                Edit
              </button>
            </ul>
          </div>
        ),
      },
    ],
    [onDelete, onEdit, onDeactivate, onActivate]
  );

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    page, // Use page instead of rows for pagination
    prepareRow,
    state: { pageIndex, pageSize },
    gotoPage,
    nextPage,
    previousPage,
    setPageSize,
    canNextPage,
    canPreviousPage,
    pageCount,
    setPageIndex,
  } = useTable(
    { columns, data: users, initialState: { pageIndex: 0 } },
    useSortBy,
    usePagination
  );

  return (
    <div>
      <div className="tableContainer">
        <table {...getTableProps()} className="table table-striped">
          <thead>
            {headerGroups.map((headerGroup) => (
              <tr {...headerGroup.getHeaderGroupProps()}>
                {headerGroup.headers.map((column) => (
                  <th {...column.getHeaderProps(column.getSortByToggleProps())}>
                    {column.render("Header")}
                    <span>
                      {column.isSorted
                        ? column.isSortedDesc
                          ? " 🔽"
                          : " 🔼"
                        : ""}
                    </span>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody {...getTableBodyProps()}>
            {page.map((row) => {
              prepareRow(row);
              return (
                <tr {...row.getRowProps()}>
                  {row.cells.map((cell) => (
                    <td {...cell.getCellProps()}>{cell.render("Cell")}</td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="pagination justify-content-end p-2">
        <p
          className="btn btn-secondary fs-6 bi bi-chevron-double-left me-2"
          onClick={() => gotoPage(0)}
          disabled={!canPreviousPage}
        ></p>
        <p
          className="btn btn-secondary fs-6 bi bi-chevron-left me-2"
          onClick={() => previousPage()}
          disabled={!canPreviousPage}
        ></p>
        <span className=" me-2 mt-2">
          Page
          <strong className="ms-2">
            {pageIndex + 1} of {pageCount}
          </strong>
        </span>
        <p
          className="btn btn-secondary fs-6 bi bi-chevron-right me-2"
          onClick={() => nextPage()}
          disabled={!canNextPage}
        ></p>
        <p
          className="btn btn-secondary fs-6 bi bi-chevron-double-right"
          onClick={() => gotoPage(pageCount - 1)}
          disabled={!canNextPage}
        ></p>
        
        {/* <select
          value={pageSize}
          onChange={(e) => setPageSize(Number(e.target.value))}
        >
          {[10, 20, 30, 40, 50].map((pageSize) => (
            <option key={pageSize} value={pageSize}>
              Show {pageSize}
            </option>
          ))}
        </select> */}
      </div>
    </div>
  );
};

export default DataTable;
