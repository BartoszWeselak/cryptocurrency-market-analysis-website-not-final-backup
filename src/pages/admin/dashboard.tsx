import { Button } from "~/components/Button";
import Layout from "~/components/layout/layout";
import { api } from "~/utils/api";
import { useSession } from "next-auth/react";
import React from "react";
import StatisticsTable from "~/components/StatisticTable";

const AdminDashboardPage = () => {
  const apiContext = api.useUtils();
  const getAllCurrenciesQuery = api.admin.getAllCurrenciesAdmin.useQuery();
  const getAllUsersQuery = api.admin.getAllUsers.useQuery();
  const addCurrencyHistoryMutation = api.admin.addCurrency.useMutation({
    onSuccess: () => {
      void apiContext.admin.getAllCurrenciesAdmin.invalidate();
    },
  });
  const deleteCurrencyMutation = api.admin.deleteCurrencyById.useMutation();
  const deleteUserMutation = api.admin.deleteUserById.useMutation();
  const session = useSession();

  function handleAddCurrencyHistory() {
    addCurrencyHistoryMutation.mutate({ currencyName: "aave" });
  }

  function handleDeleteCurrency(id) {
    deleteCurrencyMutation.mutate({ id });
  }

  function handleDeleteUser(userId) {
    deleteUserMutation.mutate({ id: userId });
  }

  // Dane dla tabeli użytkowników
  const userData = getAllUsersQuery.data?.map((userItem) => ({
    name: userItem.email,
    value1: (
      <Button onClick={() => handleDeleteUser(userItem.id)}>Delete User</Button>
    ),
  }));

  // Dane dla tabeli walut
  const currencyData = getAllCurrenciesQuery.data?.map((currency) => ({
    name: currency.name,

    value1: (
      <Button onClick={() => handleDeleteCurrency(currency.id)}>Delete</Button>
    ),
  }));

  return (
    <Layout>
      <div>
        <StatisticsTable
          data={currencyData}
          columnName1="Currency"
          columnName2="Action"
          enableSorting={false}
        />
        <Button onClick={handleAddCurrencyHistory}>Add Bunch</Button>
      </div>

      <div>
        <StatisticsTable
          data={userData}
          columnName1="User"
          columnName2="Action"
          enableSorting={false}
        />
      </div>
    </Layout>
  );
};

export default AdminDashboardPage;
