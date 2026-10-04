const assert = require('assert');
const { analyzeDiff } = require('../bin/analyzer');

// Test 1: Direct GORM query inside handler (RULE-GO-01)
const badGinCode = `package handlers
import (
  "net/http"
  "github.com/gin-gonic/gin"
)
func GetUsers(c *gin.Context) {
  var users []User
  db.Where("active = ?", true).Find(&users)
  c.JSON(http.StatusOK, users)
}`;
const badGinViolations = analyzeDiff(badGinCode, 'handlers/users.go').filter(v => v.ruleId === 'RULE-GO-01');
assert.strictEqual(badGinViolations.length, 1, 'Direct GORM query should trigger RULE-GO-01');
assert.strictEqual(badGinViolations[0].severity, 'warning', 'Query should be warning');

// Test 2: Direct DB Exec/Mutation inside handler (RULE-GO-01)
const badExecCode = `package handlers
import (
  "net/http"
  "github.com/gin-gonic/gin"
)
func DeleteUser(c *gin.Context) {
  id := c.Param("id")
  db.Exec("DELETE FROM users WHERE id = ?", id)
  c.Status(http.StatusNoContent)
}`;
const badExecViolations = analyzeDiff(badExecCode, 'handlers/users.go').filter(v => v.ruleId === 'RULE-GO-01');
assert.strictEqual(badExecViolations.length, 1, 'db.Exec should trigger RULE-GO-01');
assert.strictEqual(badExecViolations[0].severity, 'critical', 'db.Exec should be critical');

// Test 3: Silenced error _ = err (RULE-GO-02)
const badErrCode = `package handlers
func ProcessData() {
  data, err := FetchData()
  _ = err
}`;
const badErrViolations = analyzeDiff(badErrCode, 'services/processor.go').filter(v => v.ruleId === 'RULE-GO-02');
assert.strictEqual(badErrViolations.length, 1, 'Silenced error should trigger RULE-GO-02');

// Test 4: Clean Architecture using service layer
const goodCode = `package handlers
func GetUsers(c *gin.Context) {
  users, err := userService.GetActiveUsers(c.Request.Context())
  if err != nil {
    c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
    return
  }
  c.JSON(http.StatusOK, users)
}`;
const goodViolations = analyzeDiff(goodCode, 'handlers/users.go').filter(v => v.ruleId.startsWith('RULE-GO'));
assert.strictEqual(goodViolations.length, 0, 'Clean architecture should have 0 violations');

// Test 5: Direct DB query inside repository is allowed!
const goodRepoCode = `package repository
func (r *UserRepository) FindActive(ctx context.Context) ([]User, error) {
  var users []User
  err := r.db.WithContext(ctx).Where("active = ?", true).Find(&users).Error
  return users, err
}`;
const goodRepoViolations = analyzeDiff(goodRepoCode, 'repository/user_repo.go').filter(v => v.ruleId.startsWith('RULE-GO'));
assert.strictEqual(goodRepoViolations.length, 0, 'Repository layer DB access is allowed');

console.log('✅ All Golang Clean Architecture & Error Handling rule tests passed successfully!');
