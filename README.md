# fastdeal.live

지역 기반으로 공연 티켓을 발행할 때 많은 사용자가 동시에 티켓을 구매하려 시도하는 트래픽 스파이크 상황을 재현했습니다.

이를 통해 각 단계에서 발생하는 병목 현상을 분석하고 개선하는 과정을 중점적으로 다룬 토이프로젝트입니다.

# 주요 내용

## 병목현상 개선의 프로세스

- 트래픽 스파이크 재현: 1만개의 티켓에 대해 5분간 90000명의 사용자가 동시에 요청하는 시나리오
  - 0 ~ 1분: 1초당 100명의 사용자 요청 (6,000)
  - 1 ~ 2분: 1초당 200명의 사용자 요청 (12,000)
  - 2 ~ 3분: 1초당 300명의 사용자 요청 (18,000)
  - 3 ~ 4분: 1초당 400명의 사용자 요청 (24,000)
  - 4 ~ 5분: 1초당 500명의 사용자 요청 (30,000)

- 병목현상 분석: 부하테스트중 발생하는 에러 메시지와 데이터베이스 상태 확인 등을 통해 분석

- 성능 개선
  - Next-Key-Lock vs Redis 분산락  
  - 서버 및 데이터베이스 병목현상 개선
  - 비즈니스 로직 최적화
  - 캐싱과 컨테이너화
  - 메시지큐를 통한 쓰로틀링 전략

## 그 이외의 관심사

- 읽기 쉬운 코드 지향

- 단일 책임 원칙 준수

- 테스트를 통한 코드의 안정성 확보

- 지속적인 리팩터링

# 아키텍처

![architecture](https://github.com/user-attachments/assets/c2ae5a33-7f63-4d59-8343-428a27757c25)

1. docker-compose와 pm2를 이용한 서버 및 인스턴스 클러스터링
2. Nginx를 통한 로드벨런싱 (round robin)
3. 캐시 Redis를 이용한 데이터베이스 부하 방지
4. 락 Redis를 이용한 분산락
5. 큐 Redis를 이용한 메시지큐 쓰로틀링

# 성능 개선

## 부하 테스트를 통한 락 전략의 효율성 비교

MySQL의 Next-Key-Lock과 Redis를 활용한 분산락 중 어느 것이 더 효율적인지에 대해 고민했습니다. 

Next-Key-Lock의 경우 인덱스와 그 다음 인덱스 사이의 갭에 락을 걸기 때문에 데이터베이스에 부하가 많이 발생할 수 있고 Redis 분산락은 짧은 주기로 락을 요청하기 때문에 서버에 부하가 많이 발생할 수 있습니다. 두 방식의 성능을 비교하기 위해 부하 테스트를 진행했고 결과는 다음과 같았습니다.

- Next-Key-Lock의 응답시간 중앙값은 79.1ms로 나타났으며, EPIPE 에러가 1403회 발생했습니다.
- Redis 분산락의 응답시간 중앙값은 6ms로 나타났으며, EPIPE 에러가 216회 발생했습니다.

테스트 결과 Redis 분산락이 Next-Key-Lock보다 응답속도가 빠르고 에러 빈도가 낮다는 결론을 얻었습니다. 이러한 결과를 바탕으로 동시성 제어를 위해 Redis 분산락을 선택했습니다.

Next-Key-Lock 테스트 결과: https://66e838a4e030c70084ba540c--fastdeal-test-result.netlify.app/next-key-lock-report

Redis 분산락 테스트 결과: https://66e838a4e030c70084ba540c--fastdeal-test-result.netlify.app/redis-lock-report

## 서버 병목현상 개선

Redis 분산락을 사용했음에도 불구하고 EPIPE에러가 216회 발생했기 때문에 해당 문제를 해결해야 했습니다.

SHOW ENGINE INNODB STATUS 명령어를 실행하여 데이터베이스의 상태를 파악하고 성능에 문제가 없음을 확인했습니다. 서버에 병목현상이 있다고 판단하여 PM2를 이용해 프로세스를 5개로 확장 했습니다

- EPIPE 에러가 216회에서 9회로 크게 줄어들며, 서버의 병목현상이 어느 정도 해결되었습니다.

서버 및 데이터베이스 병목현상 개선 테스트 결과: https://66e838a4e030c70084ba540c--fastdeal-test-result.netlify.app/redis-lock-pm2-report

## 데이터베이스 병목현상 개선

전반적인 성능은 개선되었지만 이번에는 "Unable to start a transaction in the given time" 에러가 새롭게 발생했기 때문에 이 문제를 해결할 필요가 있었습니다.

트랜잭션이 시간 내에 완료되지 않았다는 의미이기 때문에 데이터베이스 처리 성능에 문제가 있을 가능성이 크다고 판단했습니다. 데이터베이스의 상태를 확인한 결과 서버 프로세스를 5배로 늘린 영향으로 데이터베이스의 처리 성능이 저하된 것을 확인할 수 있었습니다.

로컬 MySQL을 확인해본 결과 기본 buffer pool size가 128MB로 설정되어 있었습니다. 이전에 사용하던 AWS t3.small 인스턴스는 2GB 메모리를 가지고 있었고 MySQL은 메모리 용량의 50%를 버퍼 풀로 사용하는 것이 일반적이기 때문에 이를 고려해서 buffer pool size를 1GB로 조정하였고 그 결과는 다음과 같았습니다.

- "Unable to start a transaction in the given time" 에러가 완전히 사라졌습니다.

서버 및 데이터베이스 병목현상 개선 테스트 결과: https://66e838a4e030c70084ba540c--fastdeal-test-result.netlify.app/redis-lock-pm2-report

## 코드 레벨 최적화

티켓 예약 가능 여부를 판단한 뒤 불가능할 경우 에러를 던지는 기존 방식은 유저가 급격히 몰릴 때 병목현상을 유발할 수 있다고 판단했습니다. 이를 개선하기 위해 에러를 던지지 않고 성공 여부를 반환하는 방식으로 수정했습니다. 그 결과는 다음과 같았습니다.

- 응답시간 중앙값이 6ms에서 4ms로 크게 개선되었습니다.
- p99 응답 시간(99%의 사용자가 받는 응답 시간)이 963.1ms에서 391.6ms로 크게 개선되었습니다.

코드 레벨 최적화 테스트 결과: https://66e838a4e030c70084ba540c--fastdeal-test-result.netlify.app/optimize-error-handle-report

## 캐싱과 컨테이너화를 통한 성능 개선

서버와 데이터베이스 병목현상을 개선해도 ECONNRESET 에러가 2766회 발생했기 때문에 이 문제를 해결하기 위해 추가적인 조치가 필요했습니다. 먼저 ECONNRESET 에러의 유력한 원인 두가지를 파악했습니다.

1. 데이터베이스 연결 작업에서 발생하는 병목현상으로 인해 서버의 성능이 저하되었다.
2. OS에서 소켓(socket) 연결 수의 한계가 문제일 수 있다. (예: Linux의 기본 설정으로는 1024개의 동시 접속만 허용)

첫 번째 문제를 해결하기 위해 캐싱 전략을 도입했습니다. 티켓 예약 요청을 할 때 데이터베이스에 접근하기 이전에 캐시를 거치도록 했습니다. 데이터베이스에서 티켓 정보를 가져오면 해당 티켓을 "예약된 상태"로 가정하고 캐시에 저장했습니다.

OS의 소켓 연결제한 문제를 해결하기 위해 서버를 컨테이너화하여 동시 접속 수를 분산시켰습니다. docker-compose를 이용해 4개의 서버 인스턴스를 띄우고, Nginx를 사용해 로드 밸런싱을 했습니다. 이를 통해 다수의 연결 요청이 한 서버에 집중되지 않도록 하여 소켓 연결 제한 문제를 해결했고 그 결과는 다음과 같았습니다.

- ECONNRESET 에러가 완전히 사라졌습니다.

캐싱과 컨테이너화 테스트 결과: https://66e838a4e030c70084ba540c--fastdeal-test-result.netlify.app/containerize-report

## 메시지큐를 통한 쓰로틀링 전략 도입

이번에는 데이터베이스가 다룰 수 있는 커넥션의 갯수가 초과되었다는 “Too many connection” 에러가 새롭게 609회 발생했습니다. 이를 해결하기 위해 메시지큐를 통한 쓰로틀링(throttling) 전략을 도입하기로 결정했습니다.

Nest.js에서 공식적으로 지원하고, 특정 클라우드 서비스에 종속되지 않으며, 무료로 사용할 수 있는 Redis BullMQ를 메시지 큐로 선택했습니다.

단순 티켓 조회 작업과 트랜잭션이 필요한 예약 작업을 분리했습니다. 티켓 조회가 완료된 후 예약에 필요한 정보를 메시지 큐에 넣었습니다. 이후 1초에 1개의 요청만 처리하도록 설정된 프로세서에 메시지 큐가 작업을 push하여 예약 요청을 처리했습니다. 이를 통해 데이터베이스로 향하는 연결의 숫자를 효과적으로 제어할 수 있었고 그 결과는 다음과 같았습니다.

- "Too many connections" 에러가 더 이상 발생하지 않았으며 서버는 대규모 동시 요청을 매우 안정적으로 처리할 수 있게 되었습니다. (5분간 90000개의 요청 중 89999의 요청 성공)
- p99 응답 시간(99%의 사용자가 받는 응답 시간)이 376.2ms에서 232.8ms로 개선되었습니다.

메시지 큐 쓰로틀링 테스트 결과: https://66e838a4e030c70084ba540c--fastdeal-test-result.netlify.app/buffer-queue-report

# 테스트 커버리지

TDD 기법 도입: https://hardworking-everyday.tistory.com/289

86.63%의 테스트 커버리지 달성.

![test-coverage](https://github.com/user-attachments/assets/90934019-6081-46c5-8b47-790d7029f854)
