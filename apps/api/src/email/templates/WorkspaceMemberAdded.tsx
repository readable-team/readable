import { Body, Button, Container, Head, Html, Preview, Section, Text } from '@react-email/components';

type Props = {
  dashboardUrl: string;
  workspaceId: string;
  workspaceName: string;
};

const Email = (props: Props) => {
  return (
    <Html lang="ko">
      <Head />
      <Preview>"{props.workspaceName}" 워크스페이스에 추가되었어요</Preview>
      <Body style={{ color: '#191b1c', backgroundColor: '#ffffff' }}>
        <Container style={{ maxWidth: '480px', margin: '0 auto' }}>
          <Section style={{ border: '1px solid #e2e3e5', borderRadius: '4px', padding: '24px', textAlign: 'center' }}>
            <Text>아래 버튼을 클릭해 "{props.workspaceName}" 워크스페이스를 확인하세요</Text>
            <Button
              href={`${props.dashboardUrl}/workspace/${props.workspaceId}`}
              style={{
                borderRadius: '8px',
                padding: '12px 24px',
                fontSize: '14px',
                fontWeight: '600',
                color: '#ffffff',
                backgroundColor: '#191b1c',
              }}
            >
              워크스페이스 접속하기
            </Button>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

Email.PreviewProps = {
  dashboardUrl: 'http://localhost:4100',
  workspaceId: ':workspaceId',
  workspaceName: '테스트컴퍼니',
};

export default Email;
