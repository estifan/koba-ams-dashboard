import { gql } from '@apollo/client';

export const GET_EMPLOYEES = gql`
  query GetEmployeeUsers {
    GetEmployeeUsers {
      id
      fullName
    }
  }
`;

export const GET_BRANCHES = gql`
  query Branches {
    branches {
      id
      name
    }
  }
`;

export const GET_ORDERS = gql`
  query Orders(
    $employeeId: ID
    $branchId: ID
    $startDate: String
    $endDate: String
    $page: Int
    $limit: Int
    $orderType: OrderType
  ) {
    orders(
      employeeId: $employeeId
      branchId: $branchId
      startDate: $startDate
      endDate: $endDate
      page: $page
      limit: $limit
      orderType: $orderType
    ) {
      id
      employee {
        id
        fullName
      }
      branch {
        id
        name
      }
      employeeId
      branchId
      orderType
      guestNote
      totalAmount
      items {
        id
        menuItem {
          id
          name
          price
        }
        quantity
        price
      }
      createdAt
    }
  }
`;
