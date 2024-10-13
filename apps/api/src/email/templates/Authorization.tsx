import { Body, Button, Container, Head, Hr, Html, Img, Preview, Text } from '@react-email/components';

type Props = {
  dashboardUrl: string;
  websiteUrl: string;
  code: string;
};

const Email = (props: Props) => {
  return (
    <Html lang="ko">
      <Head />
      <Preview>이메일을 인증해주세요</Preview>
      <Body style={{ color: '#191b1c', backgroundColor: '#ffffff' }}>
        <Container style={{ maxWidth: '580px', margin: '0 auto', padding: '42px' }}>
          <Text style={{ marginTop: '24px', marginBottom: 0, fontSize: '24px' }}>
            <span style={{ fontWeight: 800 }}>이메일을 인증해주세요</span>
          </Text>
          <Text style={{ marginTop: '8px', marginBottom: '32px', color: '#52525B' }}>
            이 이메일은 10분간 유효합니다
          </Text>
          <Button
            href={`${props.dashboardUrl}/auth/email?code=${props.code}`}
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
            인증하기
          </Button>
          <Hr style={{ margin: '40px 0 32px', background: 'rgba(228, 228, 231, 0.80)' }} />
          <a href={props.websiteUrl}>
            <Img src="https://cdn.rdbl.app/email/logo-full.png" style={{ width: '99px' }} />
          </a>
          <Text style={{ marginTop: '12px', fontSize: '12px', color: '#71717A' }}>
            주식회사 펜슬컴퍼니 | hello@penxle.io
            <br />
            서울특별시 강남구 강남대로100길 14, 6층
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

Email.PreviewProps = {
  dashboardUrl: 'http://localhost:4100',
  websiteUrl: 'http://localhost:4000',
  code: '123456',
};

export default Email;
