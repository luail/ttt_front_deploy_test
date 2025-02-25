<template>
  <v-container>
    <v-row justify="center">
      <v-col cols="12" md="10">
        <!-- 첫 번째 카드: 날짜/시간 선택 -->
        <v-card class="mb-6">
          <v-card-title class="text-h5 font-weight-bold">
            회의실 예약
          </v-card-title>
          <v-card-text>
            <v-row>
              <!-- 날짜 선택 -->
              <v-col cols="12" md="6">
                <v-date-picker
                  v-model="selectedDate"
                  :min="minDate"
                  :max="maxDate"
                  class="mt-4 mx-auto"
                  elevation="2"
                  full-width
                ></v-date-picker>
              </v-col>
              
              <!-- 시간 선택 -->
              <v-col cols="12" md="6">
                <v-card-subtitle class="px-0">예약 시간 선택</v-card-subtitle>
                <v-row>
                  <v-col cols="6">
                    <v-select
                      v-model="startTime"
                      :items="availableStartTimes"
                      label="시작 시간"
                      @change="updateEndTimes"
                      outlined
                      dense
                    ></v-select>
                  </v-col>
                  <v-col cols="6">
                    <v-select
                      v-model="endTime"
                      :items="availableEndTimes"
                      label="종료 시간"
                      :disabled="!startTime"
                      outlined
                      dense
                    ></v-select>
                  </v-col>
                </v-row>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>

        <!-- 두 번째 카드: 회의실 선택 -->
        <v-card>
          <v-card-title class="text-h6">회의실 선택</v-card-title>
          <v-card-text>
            <v-row>
              <v-col v-for="room in rooms" :key="room.id" cols="12" sm="6" md="4">
                <v-hover v-slot="{ hover }">
                  <v-card
                    :elevation="hover ? 8 : 2"
                    :class="{ 'selected-room': selectedRoom === room.id }"
                    @click="selectRoom(room)"
                    :disabled="!isRoomAvailable(room)"
                    class="room-card"
                  >
                    <div class="room-icon-wrapper">
                      <v-icon size="64" :color="selectedRoom === room.id ? 'primary' : 'grey'">
                        {{ getRoomIcon(room) }}
                      </v-icon>
                    </div>
                    <v-card-title class="justify-center text-center">
                      {{ room.name }}
                    </v-card-title>
                    <v-card-text class="text-center">
                      <div class="room-info">
                        <v-icon small class="mr-1">mdi-account-group</v-icon>
                        {{ room.capacity }}명
                      </div>
                      <div class="room-info">
                        <v-icon small class="mr-1">mdi-map-marker</v-icon>
                        {{ room.location }}
                      </div>
                      <v-chip
                        :color="isRoomAvailable(room) ? 'success' : 'error'"
                        small
                        class="mt-2"
                      >
                        {{ isRoomAvailable(room) ? '예약 가능' : '예약 불가' }}
                      </v-chip>
                    </v-card-text>
                  </v-card>
                </v-hover>
              </v-col>
            </v-row>
          </v-card-text>

          <!-- 예약 버튼 -->
          <v-card-actions class="justify-end pa-4">
            <v-btn
              color="primary"
              :disabled="!canBook"
              @click="bookRoom"
              elevation="2"
              x-large
            >
              예약하기
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  name: 'BookRoom',
  data() {
    return {
      selectedDate: new Date().toISOString().substr(0, 10),
      startTime: null,
      endTime: null,
      selectedRoom: null,
      rooms: [
        { id: 1, name: '회의실 A', capacity: 4, location: '3층', type: 'small' },
        { id: 2, name: '회의실 B', capacity: 6, location: '3층', type: 'small' },
        { id: 3, name: '회의실 C', capacity: 8, location: '4층', type: 'medium' },
        { id: 4, name: '회의실 D', capacity: 12, location: '4층', type: 'medium' },
        { id: 5, name: '회의실 E', capacity: 20, location: '5층', type: 'large' },
      ],
      // 30분 단위의 시간 슬롯 생성
      timeSlots: [
        { value: '18:00', text: '18:00' },
        { value: '18:30', text: '18:30' },
        { value: '19:00', text: '19:00' },
        { value: '19:30', text: '19:30' },
        { value: '20:00', text: '20:00' },
        { value: '20:30', text: '20:30' },
        { value: '21:00', text: '21:00' },
        { value: '21:30', text: '21:30' },
        { value: '22:00', text: '22:00' },
      ]
    }
  },
  computed: {
    minDate() {
      return new Date().toISOString().substr(0, 10)
    },
    maxDate() {
      const date = new Date()
      date.setMonth(date.getMonth() + 1)
      return date.toISOString().substr(0, 10)
    },
    availableStartTimes() {
      // 마지막 시간(22:00)은 시작 시간으로 선택 불가
      return this.timeSlots.filter(time => time.value !== '22:00')
    },
    availableEndTimes() {
      if (!this.startTime) return []
      // 선택된 시작 시간 이후의 시간만 필터링
      return this.timeSlots.filter(time => {
        return time.value > this.startTime
      })
    },
    canBook() {
      return this.selectedDate && 
             this.startTime !== null && 
             this.endTime !== null && 
             this.selectedRoom !== null
    }
  },
  methods: {
    updateEndTimes() {
      // 시작 시간이 종료 시간보다 늦거나 같은 경우 종료 시간 초기화
      if (this.startTime >= this.endTime) {
        this.endTime = null
      }
    },
    selectRoom(room) {
      if (this.isRoomAvailable(room)) {
        this.selectedRoom = room.id
      }
    },
    isRoomAvailable(room) {
      // room 파라미터 사용
      return !room.isBooked; // 예시: isBooked 속성으로 예약 가능 여부 확인
    },
    async bookRoom() {
      try {
        const bookingData = {
          roomId: this.selectedRoom,
          date: this.selectedDate,
          startTime: this.startTime,
          endTime: this.endTime,
          userId: this.$store.state.userId
        }
        
        // const response = await axios.post('/api/bookings', bookingData)
        console.log('예약 데이터:', bookingData)
        
        // 성공 메시지 표시
        this.$toast.success('예약이 완료되었습니다.')
        
        // 입력 필드 초기화
        this.resetForm()
      } catch (error) {
        console.error('예약 실패:', error)
        this.$toast.error('예약에 실패했습니다. 다시 시도해주세요.')
      }
    },
    resetForm() {
      this.selectedDate = new Date().toISOString().substr(0, 10)
      this.startTime = null
      this.endTime = null
      this.selectedRoom = null
    },
    getRoomIcon(room) {
      // 회의실 크기에 따라 다른 아이콘 반환
      switch(room.type) {
        case 'small':
          return 'mdi-desk';
        case 'medium':
          return 'mdi-desk-multiple';
        case 'large':
          return 'mdi-google-classroom';
        default:
          return 'mdi-office-building';
      }
    }
  }
}
</script>

<style scoped>
.room-card {
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.room-icon-wrapper {
  padding: 20px 0;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  transition: all 0.3s ease;
}

.room-card:hover:not([disabled]) {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15) !important;
  border-color: #E3F2FD;
}

.room-card:hover:not([disabled]) .room-icon-wrapper {
  transform: scale(1.1);
}

.room-card[disabled] {
  opacity: 0.7;
  cursor: not-allowed;
}

.selected-room {
  border: 2px solid #1976D2 !important;
  background-color: #E3F2FD;
}

.room-info {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 8px;
}

.v-card-title {
  font-size: 1.1rem !important;
  padding: 12px !important;
}

.v-card-text {
  padding-top: 0 !important;
}
</style>
