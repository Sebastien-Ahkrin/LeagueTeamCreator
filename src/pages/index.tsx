import Layout from '../components/Layout';
import PlayerCard from '../components/PlayerCard';
import {
  ButtonGroup,
  useOnOff,
  FormRHFModal,
  InputFieldRHF,
  SubmitButtonRHF,
} from '../components/tailwind-ui';
import { usePlayerLocalStorage } from '../hooks/usePlayerLocalStorage';

export default function IndexPage() {
  const { players } = usePlayerLocalStorage();

  return (
    <Layout>
      <Layout.Container>AAA</Layout.Container>
      <Layout.Cards>
        <div className="flex flex-col gap-5">
          <ActionBar />

          {players.map((player) => {
            return <PlayerCard key={player.username} {...player} />;
          })}
        </div>
      </Layout.Cards>
    </Layout>
  );
}

function ActionBar() {
  const [isPlusModalOpen, openPlusModal, closePlusModal] = useOnOff(false);
  const { addPlayerToMemory } = usePlayerLocalStorage();

  const defaultValues = {
    username: '',
  };

  function onSubmit(values: typeof defaultValues) {
    addPlayerToMemory({ username: values.username });
  }

  return (
    <>
      <ButtonGroup>
        <ButtonGroup.Button>Reload</ButtonGroup.Button>
        <ButtonGroup.Button onClick={openPlusModal}>Plus</ButtonGroup.Button>
        <ButtonGroup.Button disabled>Export</ButtonGroup.Button>
        <ButtonGroup.Button disabled>Import</ButtonGroup.Button>
      </ButtonGroup>

      <FormRHFModal
        isOpen={isPlusModalOpen}
        onRequestClose={closePlusModal}
        onSubmit={onSubmit}
        defaultValues={defaultValues}
      >
        <FormRHFModal.Header className="w-[600px]">
          Add user to memory
        </FormRHFModal.Header>
        <FormRHFModal.Body>
          <InputFieldRHF
            label="Username"
            name="username"
            placeholder="eTc Ahkrin"
          />
        </FormRHFModal.Body>
        <FormRHFModal.Footer>
          <SubmitButtonRHF>Submit</SubmitButtonRHF>
        </FormRHFModal.Footer>
      </FormRHFModal>
    </>
  );
}
