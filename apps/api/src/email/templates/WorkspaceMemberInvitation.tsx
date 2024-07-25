import { Button, Heading, Section } from '@react-email/components';
import * as React from 'react';

type Props = {
  workspaceName: string;
};

const WorkspaceMemberInvitation: React.FC<Props> = (props) => {
  return (
    <Section>
      <Heading as="h1">축하합니다</Heading>
      <p>{props.workspaceName} 워크스페이스에 참여하세요</p>
      <p>아래 링크를 클릭하여 초대를 수락하세요</p>
      <Button href="https://youtu.be/dQw4w9WgXcQ">수락하기</Button>
    </Section>
  );
};

export default WorkspaceMemberInvitation;
