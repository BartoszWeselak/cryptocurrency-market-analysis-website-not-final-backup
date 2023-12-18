import { Button } from "~/components/Button";
import Layout from "~/components/layout/layout";
import { api } from "~/utils/api";
import { faker } from "@faker-js/faker";

const AdminDashboardPage = () => {
  const apiContext = api.useUtils();
  const getAllCurrenciesQuery = api.admin.getAllCurrenciesAdmin.useQuery();
  const addCurrencyHistoryMutation = api.admin.addCurrency.useMutation({
    onSuccess: () => {
      void apiContext.admin.getAllCurrenciesAdmin.invalidate();
    },
  });
  const addTestCurrenciesMutation = api.admin.addTestCurrencies.useMutation();

  function handleAddTestCurrencies() {
    addTestCurrenciesMutation.mutate({
      currencies: [
        {
          name: faker.commerce.productName(),
          snapshots: [
            {
              volumen: faker.number.int(1999), // przykładowe dane dla snapshotu
              price: faker.number.int(1999), // przykładowe dane dla snapshotu
              marketCap: faker.number.int(1999), // przykładowe dane dla snapshotu
              snapshotDate: new Date("2023-10-27"),
            },
            {
              volumen: faker.number.int(1999), // przykładowe dane dla snapshotu
              price: faker.number.int(1999), // przykładowe dane dla snapshotu
              marketCap: faker.number.int(1999), // przykładowe dane dla snapshotu
              snapshotDate: new Date("2023-10-26"),
            },
            {
              volumen: faker.number.int(1999), // przykładowe dane dla snapshotu
              price: faker.number.int(1999), // przykładowe dane dla snapshotu
              marketCap: faker.number.int(1999), // przykładowe dane dla snapshotu
              snapshotDate: new Date("2023-10-25"),
            },
            {
              volumen: faker.number.int(1999), // przykładowe dane dla snapshotu
              price: faker.number.int(1999), // przykładowe dane dla snapshotu
              marketCap: faker.number.int(1999), // przykładowe dane dla snapshotu
              snapshotDate: new Date(),
            },
            {
              volumen: faker.number.int(1999), // przykładowe dane dla snapshotu
              price: faker.number.int(1999), // przykładowe dane dla snapshotu
              marketCap: faker.number.int(1999), // przykładowe dane dla snapshotu
              snapshotDate: new Date("2023-10-24"),
            },
            {
              volumen: faker.number.int(1999), // przykładowe dane dla snapshotu
              price: faker.number.int(1999), // przykładowe dane dla snapshotu
              marketCap: faker.number.int(1999), // przykładowe dane dla snapshotu
              snapshotDate: new Date("2023-10-23"),
            },
            {
              volumen: faker.number.int(1999), // przykładowe dane dla snapshotu
              price: faker.number.int(1999), // przykładowe dane dla snapshotu
              marketCap: faker.number.int(1999), // przykładowe dane dla snapshotu
              snapshotDate: new Date("2023-10-22"),
            },
            {
              volumen: faker.number.int(1999), // przykładowe dane dla snapshotu
              price: faker.number.int(1999), // przykładowe dane dla snapshotu
              marketCap: faker.number.int(1999), // przykładowe dane dla snapshotu
              snapshotDate: new Date("2023-10-21"),
            },
          ],
        },
      ],
    });
  }

  function handleAddCurrencyHistory() {
    addCurrencyHistoryMutation.mutate({ currencyName: "maker" });
  }
  return (
    <Layout>
      <ul>
        {getAllCurrenciesQuery.data?.map((currency) => (
          <li key={currency.id}>{currency.name}</li>
        ))}
      </ul>
      <Button onClick={handleAddTestCurrencies}>add Test</Button>
      <Button onClick={handleAddCurrencyHistory}>add bunch</Button>
    </Layout>
  );
};

export default AdminDashboardPage;
