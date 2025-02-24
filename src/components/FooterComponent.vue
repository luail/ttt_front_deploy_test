<template>
  <footer class="footer">
    <div class="footer-content">
      <div class="footer-section">
        <h3>팀 정보</h3>
        <p class="team-name">4dollerExit</p>
        <p>11기 한화시스템 BEYOND SW 캠프</p>
      </div>
      
      <div class="footer-section">
        <h3>팀원</h3>
        <ul class="team-members">
          <li><a href="https://github.com/member1" target="_blank">팀원1 이름</a></li>
          <li><a href="https://github.com/member2" target="_blank">팀원2 이름</a></li>
          <li><a href="https://github.com/member3" target="_blank">팀원3 이름</a></li>
          <li><a href="https://github.com/member4" target="_blank">팀원4 이름</a></li>
          <li><a href="https://github.com/member5" target="_blank">팀원5 이름</a></li>
        </ul>
      </div>

      <div class="footer-section">
        <h3>도움을 주신 분</h3>
        <p><a href="https://inf.run/KZWA" target="_blank">Brad Kim</a></p>
      </div>

      <div class="footer-section">
        <h3>프로젝트 문서</h3>
        <ul>
          <li><a href="#" target="_blank">요구사항명세서</a></li>
          <li><a href="https://github.com/4dollerExit" target="_blank">팀 GitHub</a></li>
        </ul>
      </div>
    </div>
    
    <div class="footer-bottom">
      <p>&copy; 2025 4dollerExit. All rights reserved.</p>
    </div>
  </footer>
</template>

<script>
export default {
  name: 'FooterComponent'
}
</script>

<style scoped>
.footer {
  background-color: #38036e;
  color: #fff;
  padding: 2rem 0;
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-around;
  padding: 0 1rem;
}

.footer-section {
  flex: 1;
  margin: 0 1rem;
}

.footer-section h3 {
  margin-bottom: 1rem;
  font-size: 1.2rem;
  color: #fff;
}

.team-name {
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
}

.footer-section ul {
  list-style: none;
  padding: 0;
}

.footer-section ul li {
  margin-bottom: 0.5rem;
}

.footer-section a {
  color: #fff;
  text-decoration: none;
  transition: color 0.3s ease;
}

.footer-section a:hover {
  color: #b388ff;
}

.footer-section p a:hover {
  color: #b388ff;
}

.footer-bottom {
  text-align: center;
  margin-top: 2rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
}

@media (max-width: 768px) {
  .footer-content {
    flex-direction: column;
    text-align: center;
  }
  
  .footer-section {
    margin: 1rem 0;
  }
}
</style>