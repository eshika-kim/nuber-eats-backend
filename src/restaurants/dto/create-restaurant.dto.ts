import { ArgsType, Field, InputType, OmitType } from '@nestjs/graphql';
import { IsBoolean, IsString, Length } from 'class-validator';
import { Restaurant } from '../entities/retaurant.entity';

// @ArgsType() // => resolver에서 input으로 받지 않을 때
@InputType()
// 3번째 매개변수는 부모클래스가 다른 타입의 데코레이터를 사용할 때
// 자식 클래스는 다른 타입을 원할 때 넣어줄 수 있다.
// 현재는 부모클래스인 엔티티가 ObjectType이고
// dto는 InputType을 사용하길 원하므로 이런식으로 설정할 수도있다,
export class CreateRestaurantDto extends OmitType(Restaurant, ['id']) {}
//export class CreateRestaurantDto extends OmitType(Restaurant, ['id']) {}
