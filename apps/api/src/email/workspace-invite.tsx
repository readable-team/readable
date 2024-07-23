import { Button, Heading, Section } from '@react-email/components';

type Props = {
  workspaceName: string;
  inviterName: string;
};

const WorkspaceInvite = (props: Props) => {
  return (
    <Section>
      <Heading as="h1">축하합니다</Heading>
      <p>
        {props.inviterName}님이 {props.workspaceName} 워크스페이스에 초대했습니다
      </p>
      <p>아래 링크를 클릭하여 초대를 수락하세요</p>
      <Button href="https://youtu.be/dQw4w9WgXcQ">수락하기</Button>
    </Section>
  );
};

export default WorkspaceInvite;
