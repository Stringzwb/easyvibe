# workflow

`workflows.json` 定义工作流、节点、入口和转换关系，`steps/<step-id>/` 定义可复用 Step 的运行方式。

工作流只能由有效 Step 构成。创建工作流和创建 Step 都必须先获得用户明确确认。

每个 `workflow/steps/<step-id>/` 必须有同 ID 的 `spec/steps/<step-id>/`，任一侧缺失都不是有效 Step。
