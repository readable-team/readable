import { Body, Button, Container, Head, Hr, Html, Img, Preview, Text } from '@react-email/components';

type Props = {
  dashboardUrl: string;
  websiteUrl: string;
  email?: string;
  teamName: string;
  inviterName: string;
  inviterAvatarPath?: string;
};

const Email = (props: Props) => {
  return (
    <Html lang="ko">
      <Head />
      <Preview>"{props.teamName}" 팀에 참여하세요</Preview>
      <Body style={{ color: '#191b1c', backgroundColor: '#ffffff' }}>
        <Container style={{ maxWidth: '580px', margin: '0 auto', padding: '42px' }}>
          <Img
            src={props.inviterAvatarPath}
            style={{
              width: '64px',
              height: '64px',
              border: '1px solid rgba(209, 211, 215, 0.6)',
              borderRadius: '50%',
            }}
          />
          <Text style={{ marginTop: '24px', marginBottom: 0, fontSize: '24px' }}>
            <span style={{ fontWeight: 800 }}>{props.inviterName} </span>
            <span>님이 </span>
            <span style={{ fontWeight: 800 }}>{props.teamName} </span>
            <span>팀에 초대했어요</span>
          </Text>
          <Text style={{ marginTop: '8px', marginBottom: '32px', color: '#52525B' }}>
            팀원들과 함께 사이트를 관리하고 가이드 문서를 만들어보세요
          </Text>
          <Button
            href={`${props.dashboardUrl}/auth/login${props.email ? `?email=${props.email}` : ''}`}
            style={{
              borderRadius: '10px',
              padding: '10px 30px',
              fontSize: '16px',
              fontWeight: '700',
              color: '#ffffff',
              backgroundColor: '#FF5E00',
              textAlign: 'center',
              lineHeight: '144%',
            }}
          >
            가입하기
          </Button>
          <Hr style={{ margin: '40px 0 32px', background: 'rgba(228, 228, 231, 0.80)' }} />
          <a href={props.websiteUrl}>
            <Img src="https://cdn.rdbl.app/email/logo-full.png" style={{ width: '99px' }} />
          </a>
          <Text style={{ marginTop: '6px', fontSize: '12px', color: '#71717A' }}>
            Copyright 2024 readable. All rights reserved.
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

Email.PreviewProps = {
  dashboardUrl: 'http://localhost:4100',
  websiteUrl: 'https://rdbl.ninja',
  teamName: '유키컴퍼니',
  email: 'test@test.com',
  inviterName: '유키',
};

export default Email;
